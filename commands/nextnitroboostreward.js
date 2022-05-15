const Discord = require('discord.js');
const pool = require('../database');
const settings = require('../settings');
const { discordBot: discordBotConfig } = require('../settings/config');

const { green } = discordBotConfig;

module.exports.run = async (bot, message, args) => {
  try {
    if (message.channel.type !== 'dm') {
      message.delete();
    }
    if (args[0] === 'help' || args.length !== 0) {
      message.author.send('Usage: !nextnitroboostreward');
      return;
    }

    try {
      await pool(async (conn) => {
        const [existingNitroBooster] = await conn.query('SELECT * FROM discord.nitro_boost WHERE discordMemberId = ?', message.author.id);
        if (existingNitroBooster) {
          if (!existingNitroBooster.accountId) {
            message.author.send('You need to connect your IGN before you can receive rewards! Please type **!setnitroboostacc <ign>**.');
            return;
          }
          let totalNumberOfMinutesWithNitroBoost = settings.nitroBoost.rewardEveryXAmountOfMinutes - (existingNitroBooster.totalNumberOfMinutesWithNitroBoost % settings.nitroBoost.rewardEveryXAmountOfMinutes);
          const days = Math.floor(totalNumberOfMinutesWithNitroBoost / (60 * 24));
          totalNumberOfMinutesWithNitroBoost -= days * (60 * 24);
          const hours = Math.floor(totalNumberOfMinutesWithNitroBoost / 60);
          totalNumberOfMinutesWithNitroBoost -= hours * 60;
          const minutes = Math.floor(totalNumberOfMinutesWithNitroBoost);
          message.author.send({ embeds: [new Discord.MessageEmbed()
            .setColor(green)
            .setThumbnail('https://i.imgur.com/UXkyX2E.png')
            .setDescription(`You will receive 3,000 Maple Cash in ${days} days, ${hours} hours, and ${minutes} minutes.`)
            .setTimestamp(new Date().getTime())]});
        } else {
          message.author.send('You haven\'t Nitro Boosted OSM yet!');
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
  name: 'nextnitroboostreward',
};
