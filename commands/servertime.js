const Discord = require('discord.js');
const moment = require('moment');

module.exports.run = async (bot, message) => {
  if (!message.channel.type === 'dm') {
    message.delete();
  }
  const serverTime = moment().utc().format('dddd, MMMM Do, YYYY, h:mm:ss A');
  const servedEmbed = new Discord.MessageEmbed()
    .setColor('#00ab66')
    .setDescription(`The current in-game server time is **${serverTime}**.`);

  message.author.send({ embeds: [servedEmbed] });
};

module.exports.help = {
  name: 'servertime',
};
