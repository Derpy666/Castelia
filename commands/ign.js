const Discord = require('discord.js');
const { discordBot } = require('../settings/config');

module.exports.run = async (bot, message, args) => {
  if (message.channel.type === 'dm') {
    message.author.send('You cannot run the !ign command in a DM!');
    return;
  }
  message.delete();
  if (args[0] === 'help' || args.length !== 1) {
    message.author.send('I can track your OSM level, job, and rank if you type **!ign <character name>** into an OSM channel!');
    return;
  }
  const [characterName] = args;

  const channel = bot.guilds.cache.find(x => x.name === discordBot.channelName);
  const member = channel.members.cache.find(x => x.id === message.author.id);
  member.setNickname(`!${characterName}`);
};

module.exports.help = {
  name: 'ign',
};
