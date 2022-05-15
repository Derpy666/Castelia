const Discord = require('discord.js');
const errors = require('../utils/errors.js');
const globals = require('../globals');
const helpers = require('../helpers');
const { discordBot: discordBotConfig } = require('../settings/config');

const { green } = discordBotConfig;

const startGiveaway = (creator, amount, numberOfWinners = 1) => {
  globals.variables.giveaway.creator = creator;
  globals.variables.giveaway.started = true;
  globals.variables.giveaway.players = [];
  globals.variables.giveaway.amount = amount;
  globals.variables.giveaway.numberOfWinners = numberOfWinners;
};

module.exports.run = async (bot, message, args) => {
  try {
    if (message.channel.type === 'dm') {
      message.author.send('You cannot run the !startgiveaway command in a DM!');
      return;
    }
    message.delete();
    if (!message.member.permissions.has('KICK_MEMBERS')) return errors.noPerms(message, 'KICK_MEMBERS');
    if (args[0] === 'help' || args.length < 1) {
      message.author.send('Usage: !giveawaystart <reward amount> <optional number of winners>');
      return;
    }

    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return errors.equalPerms(message, 'MANAGE_MESSAGES');
    }

    if (globals.variables.giveaway.started) {
      message.author.send('A giveaway has already been started!');
      return;
    }

    const amount = Number(args[0]);
    const numberOfWinners = Number(args[1] || 1);
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(amount)) {
      message.author.send(`Could not convert ${args[0]} to a number!`);
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(numberOfWinners)) {
      message.author.send(`Could not convert ${args[1]} to a number!`);
      return;
    }

    startGiveaway(message.author, amount, numberOfWinners);

    const giveawayEventEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setThumbnail('https://i.imgur.com/UXkyX2E.png')
      .setDescription(`We're running a giveaway event through Discord! Type **!joingiveaway** for a chance to win **${helpers.generate.commadNumber(amount)} Maple Cash for FREE!**`)
      .addField('Command to Join', '!joingiveaway')
      .addField('Amount You Can Win', `${helpers.generate.commadNumber(amount)} Maple Cash`)
      .addField('Number of Potential Winners', `${helpers.generate.commadNumber(numberOfWinners)}`)
      .setTimestamp(message.createdAt);

    const generalChannel = message.guild.channels.find(item => item.name === 'general');
    generalChannel.send({ embeds: [giveawayEventEmbed] });
  } catch (err) {
    console.log(err);
    message.author.send(`Something went wrong: ${err.message}`);
  }
};

module.exports.help = {
  name: 'startgiveaway',
};
