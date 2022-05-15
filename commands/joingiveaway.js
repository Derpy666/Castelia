const Discord = require('discord.js');
const globals = require('../globals');
const helpers = require('../helpers');
const { discordBot: discordBotConfig } = require('../settings/config');

const { green } = discordBotConfig;

module.exports.run = async (bot, message, args) => {
  if (message.channel.type === 'dm') {
    message.author.send('You cannot run the !joingiveaway command in a DM!');
    return;
  }

  try {
    if (args[0] === 'help' || args.length !== 0) {
      message.author.send('Usage: !joingiveaway');
      return;
    }

    if (!globals.variables.giveaway.started) {
      message.delete();
      message.author.send('There is no active giveaway currently running!');
      return;
    }

    if (globals.variables.giveaway.players.includes(message.author)) {
      message.delete();
      message.author.send('You already joined the giveaway!');
      return;
    }
    globals.variables.giveaway.players.push(message.author);

    const joinedGiveawayEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setThumbnail('https://i.imgur.com/UXkyX2E.png')
      .setDescription('You\'ve been added to the giveaway! Good luck!')
      .addField('Amount You Can Win', `${helpers.generate.commadNumber(globals.variables.giveaway.amount)} Maple Cash`)
      .addField('Number of Potential Winners', `${helpers.generate.commadNumber(globals.variables.giveaway.numberOfWinners)}`)
      .setTimestamp(message.createdAt);

    message.author.send({ embeds: [joinedGiveawayEmbed] });
  } catch (err) {
    console.log(err);
    message.author.send('Something went wrong! Contact staff.');
  }
};

module.exports.help = {
  name: 'joingiveaway',
};
