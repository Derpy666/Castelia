const Discord = require('discord.js');
const errors = require('../utils/errors.js');
const pool = require('../database');
const { discordBot: discordBotConfig } = require('../settings/config');

const { green } = discordBotConfig;

module.exports.run = async (bot, message, args) => {
  try {
    if (message.channel.type === 'dm') {
      message.author.send('You cannot run the !deleteservermessage command in a DM!');
      return;
    }
    message.delete();
    if (!message.member.permissions.has('KICK_MEMBERS')) return errors.noPerms(message, 'KICK_MEMBERS');
    if (args[0] === 'help' || args.length > 0) {
      message.author.send('Usage: !deleteservermessage');
      return;
    }

    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return errors.equalPerms(message, 'MANAGE_MESSAGES');
    }

    try {
      await pool(async (conn) => {
        await conn.query('DELETE FROM osmwebsite.server_message');
      });
    } catch (err) {
      console.log(err);
    }

    message.author.send({ embeds: [new Discord.RichEmbed()
      .setColor(green)
      .setDescription('Deleted the server message.')
      .setTimestamp(message.createdAt)]});
  } catch (err) {
    console.log(err);
    message.author.send(`Something went wrong: ${err.message}`);
  }
};

module.exports.help = {
  name: 'deleteservermessage',
};
