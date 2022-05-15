const Discord = require('discord.js');
const errors = require('../utils/errors.js');
const pool = require('../database');
const globals = require('../globals');
const helpers = require('../helpers');
const { discordBot: discordBotConfig } = require('../settings/config');

const { green } = discordBotConfig;

const endGiveaway = () => {
  globals.variables.giveaway.creator = {};
  globals.variables.giveaway.started = false;
  globals.variables.giveaway.players = [];
  globals.variables.giveaway.amount = 0;
  globals.variables.giveaway.numberOfWinners = 1;
};

module.exports.run = async (bot, message, args) => {
  try {
    if (message.channel.type === 'dm') {
      message.author.send('You cannot run the !endgiveaway command in a DM!');
      return;
    }
    message.delete();
    if (!message.member.permissions.has('KICK_MEMBERS')) return errors.noPerms(message, 'KICK_MEMBERS');
    if (args[0] === 'help' || args.length !== 0) {
      message.author.send('Usage: !endgiveaway');
      return;
    }

    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return errors.equalPerms(message, 'MANAGE_MESSAGES');
    }

    if (!globals.variables.giveaway.started) {
      message.author.send('There are no currently running giveaways! You can start a giveaway by typing **!startgiveaway**.');
      return;
    }

    const usernamesOfWinners = [];
    globals.variables.giveaway.players.sort(() => Math.random() - 0.5);
    try {
      await pool(async (conn) => {
        for (let i = 0; i < globals.variables.giveaway.numberOfWinners; i += 1) {
          const player = globals.variables.giveaway.players[i];
          const code = helpers.generate.couponCode();
          const couponCodeTransaction = {
            code,
            type: 1, // Maple Cash
            item: globals.variables.giveaway.amount,
          };

          // eslint-disable-next-line no-await-in-loop
          await conn.query('INSERT INTO osm.coupon_codes SET ?', [couponCodeTransaction]);
          const couponCodeEmbed = new Discord.MessageEmbed()
            .setColor(green)
            .setThumbnail('https://i.imgur.com/UXkyX2E.png')
            .setDescription('You won the giveaway! Congratulations!!')
            .addField('Coupon Code', code)
            .addField('Amount', `${helpers.generate.commadNumber(globals.variables.giveaway.amount)} Maple Cash`)
            .setTimestamp(message.createdAt);

          // eslint-disable-next-line no-await-in-loop
          await player.send({ embeds: [couponCodeEmbed] });

          const couponCodeGeneratedEmbed = new Discord.MessageEmbed()
            .setColor(green)
            .setDescription(`${player.tag} won the giveaway.`)
            .addField('Their Coupon Code', code)
            .addField('Amount', `${helpers.generate.commadNumber(globals.variables.giveaway.amount)} Maple Cash`)
            .setTimestamp(message.createdAt);
          // eslint-disable-next-line no-await-in-loop
          await globals.variables.giveaway.creator.send({ embeds: [couponCodeGeneratedEmbed] });
          // usernamesOfWinners.push(player.tag);
          usernamesOfWinners.push(player);
        }
      });
    } catch (err) {
      console.log(err);
    }

    const giveawayEventEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setThumbnail('https://i.imgur.com/UXkyX2E.png')
      .setDescription(`The giveaway has ended! Congratulations to **${usernamesOfWinners.join(', ')}**!`)
      .addField('Amount Won', `${helpers.generate.commadNumber(globals.variables.giveaway.amount)} Maple Cash`)
      .setTimestamp(message.createdAt);

    const generalChannel = message.guild.channels.find(item => item.name === 'general');
    generalChannel.send({ embeds: [giveawayEventEmbed] });
    endGiveaway();
  } catch (err) {
    console.log(err);
    message.author.send(`Something went wrong: ${err.message}`);
  }
};

module.exports.help = {
  name: 'endgiveaway',
};
