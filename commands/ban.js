const Discord = require('discord.js');
const errors = require('../utils/errors.js');
const { discordBot: discordBotConfig } = require('../settings/config');

const { red } = discordBotConfig;

module.exports.run = async (bot, message, args) => {
  if (message.channel.type === 'dm') {
    message.author.send('You cannot run the !ban command in a DM!');
    return;
  }
  message.delete();
  if (!message.member.permissions.has('BAN_MEMBERS')) return errors.noPerms(message, 'BAN_MEMBERS');
  if (args[0] === 'help' || args.length < 2) {
    message.author.send('Usage: !ban <user> <reason>');
    return;
  }
  const [username] = args;
  const user = message.guild.member(message.mentions.users.first() || message.guild.members.get(username));
  if (!user) {
    return errors.cantFindUser(message, username);
  }
  const reason = args.slice(1).join(' ');
  if (!reason) {
    return errors.noReason(message, username, 'banning');
  }
  if (!message.member.permissions.has('MANAGE_MESSAGES')) {
    return errors.equalPerms(message, 'MANAGE_MESSAGES');
  }

  const banEmbed = new Discord.MessageEmbed()
    .setColor(red)
    .setDescription('Ban')
    .addField('Banned By', message.author)
    .addField('Banned User', user.user.tag)
    .addField('Reason', reason)
    .addField('Occured in', message.channel)
    .setTimestamp(message.createdAt);

  const incidentsChannel = message.guild.channels.find(item => item.name === 'incidents');
  if (!incidentsChannel) {
    return errors.general(message, 'Could not find the #incidents channel. Please create it so I can log all incidents.');
  }

  user.send({ embeds: [new Discord.MessageEmbed()
    .setColor(red)
    .setDescription('You\'ve been banned from the OSM discord.')
    .addField('Reason', reason)
    .addField('Occured in', message.channel)
    .setTimestamp(message.createdAt)]});

  message.guild.member(user).ban({ days: 7, reason });
  incidentsChannel.send({ embeds: [banEmbed] });
};

module.exports.help = {
  name: 'ban',
};
