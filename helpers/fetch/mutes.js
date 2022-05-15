const Discord = require('discord.js');
const pool = require('../../database');
const { discordBot: discordBotConfig } = require('../../settings/config');

module.exports = async (channelName, bot) => {
  try {
    await pool(async (conn) => {
      const mutedUsers = await conn.query('SELECT affected_user as affectedUser, punishment_expires as punishmentExpires FROM incidents WHERE punishment_expires > NOW()');
      const channel = bot.guilds.find(item => item.name === channelName);
      const mutedRole = channel.roles.find(item => item.name === 'Muted');
      mutedUsers.forEach((mutedUser) => {
        const user = channel.members.find(member => member.id === mutedUser.affectedUser);
        const muteTime = new Date(mutedUser.punishmentExpires).getTime() - new Date().getTime();
        if (muteTime > 0 && muteTime < 2147483647) {
          setTimeout(async () => {
            await user.removeRole(mutedRole.id);
            user.send({ embeds: [new Discord.MessageEmbed()
              .setColor(discordBotConfig.orange)
              .setDescription('You\'ve been unmuted from the OSM discord.')]});
          }, muteTime);
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
};
