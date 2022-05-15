const pool = require('../../database');
const has = require('../has');
const Discord = require('discord.js');
const { discordBot: discordBotConfig } = require('../../settings/config');

const { green } = discordBotConfig;

module.exports = async (bot) => {
  try {
    await pool(async (conn) => {
      const discordAccounts = await conn.query('SELECT discordUsername FROM discord.accounts WHERE receivedDonorRole = 0');
      if (discordAccounts.length > 0) {
        const channel = bot.channels.find(item => item.name === 'general');
        const donorRole = channel.guild.roles.find(r => r.name === 'Donor');
        channel.members.forEach(async (member) => {
          if (has.discordUsername(discordAccounts, member.user.tag)) {
            member.addRole(donorRole);
            await conn.query('UPDATE discord.accounts SET receivedDonorRole = 1 WHERE discordUsername = ?', [member.user.tag]);
            member.user.send({ embeds: [new Discord.MessageEmbed()
              .setColor(green)
              .setDescription('Thank you for your donation and support of OSM! You have been given a Donor tag as a thank you!')]});
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
};
