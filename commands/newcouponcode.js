const Discord = require('discord.js');
const errors = require('../utils/errors.js');
const pool = require('../database');
const helpers = require('../helpers');
const { discordBot: discordBotConfig } = require('../settings/config');

const { green } = discordBotConfig;

module.exports.run = async (bot, message, args) => {
  try {
    if (message.channel.type === 'dm') {
      message.author.send('You cannot run the !newcouponcode command in a DM!');
      return;
    }
    message.delete();
    if (!message.member.permissions.has('KICK_MEMBERS')) return errors.noPerms(message, 'KICK_MEMBERS');
    if (args[0] === 'help' || args.length !== 1) {
      message.author.send('Usage: !newcouponcode <reward amount>');
      return;
    }

    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return errors.equalPerms(message, 'MANAGE_MESSAGES');
    }

    const amount = Number(args[0]);
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(amount)) {
      message.author.send(`Could not convert ${args[0]} to a number!`);
      return;
    }
    const code = helpers.generate.couponCode();
    try {
      await pool(async (conn) => {
        const couponCodeTransaction = {
          code,
          type: 1, // Maple Cash
          item: amount,
        };

        await conn.query('INSERT INTO osm.coupon_codes SET ?', [couponCodeTransaction]);
      });
    } catch (err) {
      console.log(err);
    }

    const couponCodeEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription('New Coupon Code')
      .addField('Coupon Code', code)
      .addField('Amount', `${helpers.generate.commadNumber(amount)} Maple Cash`)
      .setTimestamp(message.createdAt);

    message.author.send({ embeds: [couponCodeEmbed] });
  } catch (err) {
    console.log(err);
    message.author.send(`Something went wrong: ${err.message}`);
  }
};

module.exports.help = {
  name: 'newcouponcode',
};
