const Discord = require('discord.js');
const errors = require('../utils/errors.js');
const pool = require('../database');
const helpers = require('../helpers');
const { discordBot: discordBotConfig } = require('../settings/config');

const { green } = discordBotConfig;

module.exports.run = async (bot, message, args) => {
  try {
    if (message.channel.type === 'dm') {
      message.author.send('You cannot run the !checkcouponcode command in a DM!');
      return;
    }
    message.delete();
    if (!message.member.permissions.has('KICK_MEMBERS')) return errors.noPerms(message, 'KICK_MEMBERS');
    if (args[0] === 'help' || args.length !== 1) {
      message.author.send('Usage: !checkcouponcode <code>');
      return;
    }

    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return errors.equalPerms(message, 'MANAGE_MESSAGES');
    }

    const code = args[0];
    try {
      await pool(async (conn) => {
        const [couponCode] = await conn.query('SELECT * FROM osm.coupon_codes WHERE code = ?', [code]);
        if (couponCode) {
          const couponCodeEmbed = new Discord.MessageEmbed()
            .setColor(green)
            .setDescription('Check Coupon Code')
            .addField('Coupon Code Status', couponCode.valid === 1 ? 'Available' : 'Claimed')
            .addField('Amount', `${helpers.generate.commadNumber(couponCode.item)} Maple Cash`)
            .setTimestamp(message.createdAt);

          message.author.send({ embeds: [couponCodeEmbed] });
        } else {
          const couponCodeEmbed = new Discord.MessageEmbed()
            .setColor(green)
            .setDescription('The coupon code does not exist.')
            .addField('Coupon Code', code)
            .setTimestamp(message.createdAt);

          message.author.send({ embeds: [couponCodeEmbed] );
        }
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
    message.author.send(`Something went wrong: ${err.message}`);
  }
};

module.exports.help = {
  name: 'checkcouponcode',
};
