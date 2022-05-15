const Discord = require('discord.js');
const pool = require('../database');
const { discordBot: discordBotConfig } = require('../settings/config');

const { green } = discordBotConfig;

module.exports.run = async (bot, message, args) => {
  try {
    if (message.channel.type !== 'dm') {
      message.delete();
    }
    if (args[0] === 'help' || args.length !== 1) {
      message.author.send('Usage: !setnitroboostacc <ign>');
      return;
    }

    const ign = args[0];
    try {
      await pool(async (conn) => {
        const [character] = await conn.query('SELECT * FROM osm.characters WHERE name = ?', [ign]);
        if (character) {
          const [existingNitroBooster] = await conn.query('SELECT * FROM discord.nitro_boost WHERE discordMemberId = ?', message.author.id);
          if (existingNitroBooster) {
            const oneDayInSeconds = 86400;
            const [existingAccConnectToNitroBoost] = await conn.query('SELECT * FROM discord.nitro_boost WHERE accountid = ? AND (NOW() - updated) <= ?', [character.accountid, oneDayInSeconds]);
            if (existingAccConnectToNitroBoost) {
              message.author.send(`The character **${ign}** is already connected to a Nitro Boost!`);
              return;
            }
            await conn.query('UPDATE discord.nitro_boost SET accountId = ? WHERE discordMemberId = ?', [character.accountid, message.author.id]);
            message.author.send({ embeds: [new Discord.RichEmbed()
              .setColor(green)
              .setThumbnail('https://i.imgur.com/UXkyX2E.png')
              .setDescription(`Connected your character **${ign}** to your Nitro Boost!\n\nYou will begin receiving **3,000 Maple Cash every week!** Thank you for your support!`)
              .setTimestamp(new Date().getTime())]});
          } else {
            message.author.send('You haven\'t Nitro Boosted OSM yet!');
          }
        } else {
          message.author.send(`Did not find any ign for **${ign}**!`);
        }
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
    message.author.send('Something went wrong! Contact staff.');
  }
};

module.exports.help = {
  name: 'setnitroboostacc',
};
