const Discord = require('discord.js');
const errors = require('../utils/errors.js');
const pool = require('../database');
const { discordBot: discordBotConfig } = require('../settings/config');

const { green } = discordBotConfig;

const extractAllText = (str) => {
  const re = /"(.*?)"/g;
  const result = [];
  let current;
  // eslint-disable-next-line no-cond-assign
  while (current = re.exec(str)) {
    result.push(current.pop().replace(/,/g, ' '));
  }
  return result.length > 0
    ? result
    : [str];
};

module.exports.run = async (bot, message, args) => {
  try {
    if (message.channel.type === 'dm') {
      message.author.send('You cannot run the !newservermessage command in a DM!');
      return;
    }
    message.delete();
    if (!message.member.permissions.has('KICK_MEMBERS')) return errors.noPerms(message, 'KICK_MEMBERS');
    if (args[0] === 'help' || args.length === 0) {
      message.author.send('Usage: !newservermessage <optional info/error/warning> <"header"> <"content">');
      return;
    }

    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return errors.equalPerms(message, 'MANAGE_MESSAGES');
    }

    let type = args[0];
    if (type.startsWith('"')) {
      type = 'info';
    } else if (type !== 'info' && type !== 'error' && type !== 'warning') {
      message.author.send({ embeds: [new Discord.MessageEmbed()
        .setColor(green)
        .setDescription('Type must be either **info**, **error**, or **warning**.')
        .addField('Inputted Text', `!newservermessage ${args.join(' ')}`)
        .setTimestamp(message.createdAt)]});
      return;
    }
    const messages = extractAllText(args);
    if (messages.length !== 2) {
      message.author.send({ embeds: [new Discord.MessageEmbed()
        .setColor(green)
        .setDescription('You must pass in a **header** and a **content** message! Make sure to surround them with quotes (").')
        .addField('Inputted Text', `!newservermessage ${args.join(' ')}`)
        .setTimestamp(message.createdAt)]});
      return;
    }
    const header = messages[0];
    const content = messages[1];
    try {
      await pool(async (conn) => {
        const serverMessageTransaction = {
          type,
          header,
          content,
        };

        await conn.query('INSERT INTO osmwebsite.server_message SET ?', [serverMessageTransaction]);
      });
    } catch (err) {
      console.log(err);
    }

    message.author.send({ embeds: [new Discord.MessageEmbed()
      .setColor(green)
      .setDescription('New Server Message')
      .addField('Inputted Text', `!newservermessage ${args.join(' ')}`)
      .addField('Type', type)
      .addField('Header', header)
      .addField('Content', content)
      .setTimestamp(message.createdAt)]});
  } catch (err) {
    console.log(err);
    message.author.send(`Something went wrong: ${err.message}`);
  }
};

module.exports.help = {
  name: 'newservermessage',
};
