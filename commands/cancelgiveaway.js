const Discord = require('discord.js');
const errors = require('../utils/errors.js');
const globals = require('../globals');
const { discordBot: discordBotConfig } = require('../settings/config');

const { green } = discordBotConfig;

const endGiveaway = () => {
  globals.variables.giveaway.creator = {};
  globals.variables.giveaway.started = false;
  globals.variables.giveaway.players = [];
  globals.variables.giveaway.amount = 0;
  globals.variables.giveaway.numberOfWinners = 1;
};

module.exports.run = async (bot, message, args) => {
  try {
    if (message.channel.type === 'dm') {
      message.author.send('You cannot run the !cancelgiveaway command in a DM!');
      return;
    }
    message.delete();
    if (!message.member.permissions.has('KICK_MEMBERS')) return errors.noPerms(message, 'KICK_MEMBERS');
    if (args[0] === 'help' || args.length !== 0) {
      message.author.send('Usage: !cancelgiveaway');
      return;
    }

    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return errors.equalPerms(message, 'MANAGE_MESSAGES');
    }

    if (!globals.variables.giveaway.started) {
      message.author.send('There are no currently running giveaways! You can start a giveaway by typing **!startgiveaway**.');
      return;
    }

    const giveawayEventEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setThumbnail('https://i.imgur.com/UXkyX2E.png')
      .setDescription('The giveaway has been cancelled!')
      .setTimestamp(message.createdAt);

    const generalChannel = message.guild.channels.find(item => item.name === 'general');
    generalChannel.send({ embeds: [giveawayEventEmbed]);
    endGiveaway();
  } catch (err) {
    console.log(err);
    message.author.send(`Something went wrong: ${err.message}`);
  }
};

module.exports.help = {
  name: 'cancelgiveaway',
};
