const Discord = require('discord.js');
const errors = require('../utils/errors.js');
const { discordBot: discordBotConfig } = require('../settings/config');

const { orange } = discordBotConfig;

module.exports.run = async (bot, message, args) => {
  if (message.channel.type === 'dm') {
    message.author.send('You cannot run the !kick command in a DM!');
    return;
  }
  message.delete();
  if (!message.member.permissions.has('KICK_MEMBERS')) return errors.noPerms(message, 'KICK_MEMBERS');
  if (args[0] === 'help' || args.length < 2) {
    message.author.send('Usage: !kick <user> <reason>');
    return;
  }
  const [username] = args;
  const user = message.guild.member(message.mentions.users.first() || message.guild.members.get(username));
  if (!user) {
    return errors.cantFindUser(message, username);
  }

  const reason = args.slice(1).join(' ');
  if (!reason) {
    return errors.noReason(message, username, 'kicking');
  }
  if (!message.member.permissions.has('MANAGE_MESSAGES')) {
    return errors.equalPerms(message, 'MANAGE_MESSAGES');
  }

  const kickEmbed = new Discord.MessageEmbed()
    .setColor(orange)
    .setDescription('Kick')
    .addField('Kicked By', message.author)
    .addField('Kicked User', user.user.tag)
    .addField('Reason', reason)
    .addField('Occured in', message.channel)
    .setTimestamp(message.createdAt);

  const incidentsChannel = message.guild.channels.find(item => item.name === 'incidents');
  if (!incidentsChannel) {
    return errors.general(message, 'Could not find the #incidents channel. Please create it so I can log all incidents.');
  }

  user.send(new Discord.MessageEmbed()
    .setColor(orange)
    .setDescription('You\'ve been kicked from the OSM discord.')
    .addField('Reason', reason)
    .addField('Occured in', message.channel)
    .setTimestamp(message.createdAt));

  message.guild.member(user).kick(reason);
  incidentsChannel.send({ embeds: [kickEmbed] });
};

module.exports.help = {
  name: 'kick',
};
