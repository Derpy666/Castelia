const Discord = require('discord.js');
const { discordBot: discordBotConfig } = require('../settings/config');

const { purple } = discordBotConfig;
const errors = require('../utils/errors.js');

module.exports.run = async (bot, message, args) => {
  if (message.channel.type === 'dm') {
    message.author.send('You cannot run the !report command in a DM!');
    return;
  }
  message.delete();
  if (args[0] === 'help' || args.length < 2) {
    message.author.send('Usage: !report <user> <reason>');
    return;
  }
  const [username] = args;
  const user = message.guild.member(message.mentions.users.first() || message.guild.members.get(username));
  if (!user) {
    return errors.cantFindUser(message, username);
  }
  const reason = args.slice(1).join(' ');
  if (!reason) {
    return errors.noReason(message, username, 'reporting');
  }

  const reportEmbed = new Discord.MessageEmbed()
    .setDescription('Report')
    .setColor(purple)
    .addField('Reported By', message.author)
    .addField('Reported User', user)
    .addField('Reason', reason)
    .addField('Occured in', message.channel)
    .setTimestamp(message.createdAt);

  const reportsChannel = message.guild.channels.find(item => item.name === 'reports');
  if (!reportsChannel) {
    return errors.general(message, 'Could not find the #reports channel. Please create it so I can log all reports.');
  }

  reportsChannel.send({ embeds: [reportEmbed] });
  message.author.send({ embeds: [new Discord.MessageEmbed()
    .setColor(purple)
    .setDescription("Thank you for your report. The OSM staff will respond to it accordingly. Here's a copy of your report:")
    .addField('Reported User', user)
    .addField('Reason', reason)
    .addField('Occured in', message.channel)
    .setTimestamp(message.createdAt)]});
};

module.exports.help = {
  name: 'report',
};
