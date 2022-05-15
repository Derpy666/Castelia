const Discord = require('discord.js');
const errors = require('../utils/errors.js');
const pool = require('../database');
const { discordBot: discordBotConfig } = require('../settings/config');

const { orange } = discordBotConfig;

module.exports.run = async (bot, message, args) => {
  if (message.channel.type === 'dm') {
    message.author.send('You cannot run the !banstreamer command in a DM!');
    return;
  }
  message.delete();
  if (!message.member.permissions.has('KICK_MEMBERS')) return errors.noPerms(message, 'KICK_MEMBERS');
  if (args[0] === 'help' || args.length !== 1) {
    message.author.send('Usage: !banstreamer <username>');
    return;
  }

  if (!message.member.permissions.has('MANAGE_MESSAGES')) {
    return errors.equalPerms(message, 'MANAGE_MESSAGES');
  }

  const username = args[0];
  let streamerIsAlreadyBanned = false;

  try {
    await pool(async (conn) => {
      const [bannedUserExists] = await conn.query('SELECT * FROM osmwebsite.banned_streamers WHERE username = ?', [username]);
      if (bannedUserExists) {
        streamerIsAlreadyBanned = true;
        message.author.send(`The streamer: **${username}** is already banned!`);
      }
    });
  } catch (err) {
    console.log(err);
  }
  if (!streamerIsAlreadyBanned) {
    try {
      await pool(async (conn) => {
        const bannedStreamer = {
          username,
          bannedBy: message.author.tag,
        };
        await conn.query(
          'INSERT INTO osmwebsite.banned_streamers SET ?',
          [bannedStreamer],
        );
      });
    } catch (err) {
      console.log(err);
    }

    const bannedStreamerEmbed = new Discord.MessageEmbed()
      .setColor(orange)
      .setDescription('Banned Streamer')
      .addField('Banned By', message.author)
      .addField('Banned Streamer', username)
      .setTimestamp(message.createdAt);

    const streamersChannel = message.guild.channels.find(item => item.name === 'streamers');
    if (!streamersChannel) {
      return errors.general(message, 'Could not find the #streamers channel. Please create it so I can log all incidents.');
    }

    streamersChannel.send({ embeds: [bannedStreamerEmbed] });
  }
};

module.exports.help = {
  name: 'banstreamer',
};
