const Discord = require('discord.js');
const pool = require('../database');
const moment = require('moment');
const settings = require('../settings');
const ms = require('ms');
const errors = require('../utils/errors.js');
const has = require('../helpers/has');
const { discordBot: discordBotConfig } = require('../settings/config');

module.exports.run = async (bot, message, args) => {
  if (message.channel.type === 'dm') {
    message.author.send('You cannot run the !mute command in a DM!');
    return;
  }
  message.delete();
  if (!message.member.permissions.has('MANAGE_MESSAGES')) return errors.noPerms(message, 'MANAGE_MESSAGES');
  if (args[0] === 'help' || args.length < 3) {
    message.author.send('Usage: !mute <user> <1s/m/h/d> <reason>');
    return;
  }
  const [username] = args;
  const user = message.guild.member(message.mentions.users.first() || message.guild.members.get(username));
  if (!user) {
    return errors.cantFindUser(message, username);
  }
  const reason = args.slice(2).join(' ');
  if (!reason) {
    return errors.noReason(message, username, 'tempmuting');
  }
  if (!message.member.permissions.has('MANAGE_MESSAGES')) {
    return errors.equalPerms(message, 'MANAGE_MESSAGES');
  }
  let mutedRole = message.guild.roles.find(item => item.name === 'Muted');
  if (!mutedRole) {
    try {
      mutedRole = await message.guild.createRole({
        name: 'muted',
        color: '#000000',
        permissions: [],
      });
      message.guild.channels.forEach(async (channel) => {
        await channel.overwritePermissions(mutedRole, {
          SEND_MESSAGES: false,
        });
      });
    } catch (e) {
      console.log(e.stack);
    }
  }
  const muteTime = args[1];
  if (!muteTime) {
    return errors.noTime(message, user);
  }
  if (has.role(user.roles, mutedRole)) {
    return errors.general(message, `${user} is already muted!`);
  }

  const muteEmbed = new Discord.MessageEmbed()
    .setColor(discordBotConfig.orange)
    .setDescription('Temporary Mute')
    .addField('Muted By', message.author)
    .addField('Muted User', user)
    .addField('Reason', reason)
    .addField('Length', muteTime)
    .addField('Occured in', message.channel)
    .setTimestamp(message.createdAt);

  const incidentsChannel = message.guild.channels.find(item => item.name === 'incidents');
  if (!incidentsChannel) {
    return errors.general(message, 'Could not find the #incidents channel. Please create it so I can log all incidents.');
  }
  incidentsChannel.send({ embeds: [muteEmbed] });
  try {
    await pool(async (conn) => {
      const punishmentExpires = moment().add(ms(muteTime)).format(settings.momentDateFormat);
      const incident = {
        type: settings.incidents.type.MUTE,
        executed_by: message.author.id,
        affected_user: user.user.id,
        reason,
        punishment_expires: punishmentExpires,
        occured_in: message.channel.name,
      };
      await conn.query('INSERT INTO incidents SET ?', [incident]);
    });
  } catch (err) {
    console.log(err);
  }

  user.send({ embeds: [new Discord.MessageEmbed()
    .setColor(discordBotConfig.orange)
    .setDescription('You\'ve been muted from the OSM discord.')
    .addField('Reason', reason)
    .addField('Length', muteTime)
    .addField('Occured in', message.channel)
    .setTimestamp(message.createdAt)]});
  await user.addRole(mutedRole.id);

  setTimeout(async () => {
    await user.removeRole(mutedRole.id);
    user.send({ embeds: [new Discord.MessageEmbed()
      .setColor(discordBotConfig.orange)
      .setDescription('You\'ve been unmuted from the OSM discord.')]});
  }, ms(muteTime));
};

module.exports.help = {
  name: 'mute',
};
