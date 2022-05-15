const Discord = require('discord.js');
const { discordBot: discordBotConfig } = require('../settings/config');

module.exports.noPerms = (message, perm) => {
  const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.username)
    .setTitle('Insufficient Permission')
    .setColor(discordBotConfig.red)
    .addField('Permission needed', perm);

  message.author.send({ embeds: [embed] });
};

module.exports.equalPerms = (message, perms) => {
  const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.username)
    .setColor(discordBotConfig.red)
    .setTitle('Error')
    .addField('Has perms', perms);

  message.author.send({ embeds: [embed] });
};

module.exports.botUser = (message) => {
  const embed = new Discord.MessageEmbed()
    .setTitle('Error')
    .setDescription('You can not ban a bot.')
    .setColor(discordBotConfig.red);

  message.author.send({ embeds: [embed] });
};

module.exports.cantFindUser = (message, username) => {
  const embed = new Discord.MessageEmbed()
    .setTitle('Error')
    .setDescription(`Could not find the user ${username}`)
    .setColor(discordBotConfig.red);

  message.author.send({ embeds: [embed] });
};

module.exports.noReason = (message, username, type) => {
  const embed = new Discord.MessageEmbed()
    .setTitle('Error')
    .setDescription(`Please provide a reason for why you are ${type} ${username}.`)
    .setColor(discordBotConfig.red);

  message.author.send({ embeds: [embed] });
};

module.exports.noTime = (message, username) => {
  const embed = new Discord.MessageEmbed()
    .setTitle('Error')
    .setDescription(`Please specify a time for when ${username}'s mute should expire.`)
    .setColor(discordBotConfig.red);

  message.author.send({ embeds: [embed] });
};

module.exports.general = (message, description) => {
  const embed = new Discord.MessageEmbed()
    .setTitle('Error')
    .setDescription(description)
    .setColor(discordBotConfig.red);

  message.author.send({ embeds: [embed] });
};
