const pool = require('../../database');
const moment = require('moment');
const Discord = require('discord.js');
const settings = require('../../settings');
const { discordBot: discordBotConfig } = require('../../settings/config');

const { green } = discordBotConfig;

const newNitroBooster = async (bot, member) => {
  try {
    await pool(async (conn) => {
      const [existingNitroBooster] = await conn.query('SELECT * FROM discord.nitro_boost WHERE discordMemberId = ?', [member.id]);
      if (!existingNitroBooster) {
        await conn.query(`
        INSERT INTO discord.nitro_boost
        SET discordMemberId = ?, discordUsername = ?
      `, [member.id, member.user.discriminator]);
      }

      // Log
      await conn.query(`
        INSERT INTO discord.log_nitro_boost
        SET discordMemberId = ?, discordUsername = ?
      `, [member.id, member.user.discriminator]);

      // Send thank you for boosting
      member.user.send({ embeds: [new Discord.MessageEmbed()
        .setColor(green)
        .setThumbnail('https://i.imgur.com/UXkyX2E.png')
        .setDescription('Thank you for Nitro Boosting OSM\'s Discord!')
        .addField('Free Maple Cash', 'Please type **!setnitroboostacc <ign>** to **earn 3,000 Maple Cash every week that you keep Nitro Boosting OSM**! That\'s **12,000 Maple Cash a month** (which is more than you would get from donating $10)!\n\nYou can type **!nextnitroboostreward** to see when you will receive your next Nitro Boost reward!\n\nYou can type **!nextnitroboostreward** to see when you will receive your next Nitro Boost reward!\n\nYou can change which account receives the FREE Maple Cash from Nitro Boosting by running **!setnitroboostacc <ign>** again.')
        .setTimestamp(new Date().getTime())]});

      const osmDiscord = bot.guilds.cache.find(guild => guild.name === discordBotConfig.channelName);
      const generalChannel = osmDiscord.channels.cache.find(channel => channel.name === 'general');

      generalChannel.send({ embeds: [new Discord.MessageEmbed()
        .setColor(green)
        .setThumbnail('https://i.imgur.com/UXkyX2E.png')
        .setDescription(`Thank you to ${member.user.tag} (${member}) for Nitro Boosting OSM's Discord!\n\nIf you Nitro Boost OSM's Discord, you can **earn 3,000 Maple Cash every week** that you keep boosting! That's **12,000 Maple Cash a month** (More than you would get from donating $10)!`)
        .setTimestamp(new Date().getTime())]});
    });
  } catch (err) {
    console.log(err);
  }
};

const checkForNitroBoost = async (bot, member, isAnUpdate) => {
  const nitroBoostRole = member.roles.cache.find(role => role.name === 'Nitro Booster');
  if (nitroBoostRole) {
    if (isAnUpdate) {
      try {
        await pool(async (conn) => {
          const [existingNitroBoost] = await conn.query('SELECT * FROM discord.nitro_boost WHERE discordMemberId = ?', [member.id]);
          if (existingNitroBoost) {
            if (
              existingNitroBoost.accountId &&
              existingNitroBoost.totalNumberOfMinutesWithNitroBoost !== 0 &&
              existingNitroBoost.totalNumberOfMinutesWithNitroBoost %
              settings.nitroBoost
                .rewardEveryXAmountOfMinutes ===
              0
            ) {
              const nitroBoostTransaction = {
                accountId: existingNitroBoost.accountId,
                amount: settings.nitroBoost.rewardForNitroBoost,
                note: settings.nitroBoost.note(existingNitroBoost.totalNumberOfMinutesWithNitroBoost),
                cashtype: settings.nitroBoost.rewardCashType,
                automatedtype: settings.automatedType.NITRO_BOOST,
              };
              await conn.query('INSERT INTO osm.account_cs_transactions SET ?', [nitroBoostTransaction]);

              await conn.query(`
                  INSERT INTO osm.notes
                  SET \`to\` = (SELECT id FROM osm.characters WHERE accountid = ? ORDER BY \`level\` DESC LIMIT 1),
                  \`from\` = 'OSM',
                  \`timestamp\` = ?,
                  message = "You have obtained 3,000 Maple Cash from Nitro Boosting OSM's Discord! Thank you for your support!"
                `, [existingNitroBoost.accountId, moment().utc().format('x')]);
            }
            await conn.query(`
            UPDATE discord.nitro_boost
            SET totalNumberOfMinutesWithNitroBoost = totalNumberOfMinutesWithNitroBoost + ?, updated = CURRENT_TIMESTAMP
            WHERE discordMemberId = ?
          `, [settings.nitroBoost.checkForNitroBoostEveryInMinutes, member.id]);
          } else {
            await conn.query(`
            INSERT INTO discord.nitro_boost
            SET discordMemberId = ?, discordUsername = ?
          `, [member.id, member.user.discriminator]);

            await newNitroBooster(bot, member);
          }
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        await pool(async (conn) => {
          const [existingNitroBoost] = await conn.query('SELECT * FROM discord.nitro_boost WHERE discordMemberId = ?', [member.id]);
          if (!existingNitroBoost) {
            await newNitroBooster(bot, member);
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
};

const isNewNitroBooster = async (bot, oldMember, newMember) => {
  if (!oldMember || !newMember) {
    return false;
  }

  const oldMemberNitroBoosterRole = oldMember.roles.find(role => role.name === 'Nitro Booster');
  const newMemberNitroBoosterRole = newMember.roles.find(role => role.name === 'Nitro Booster');
  if (!oldMemberNitroBoosterRole && newMemberNitroBoosterRole) {
    await newNitroBooster(bot, newMember);
    return true;
  }

  return false;
};

module.exports = async (bot, oldMember, newMember) => {
  if (!(await isNewNitroBooster(bot, oldMember, newMember))) {
    if (newMember) {
      await checkForNitroBoost(bot, newMember);
    } else {
      const channel = bot.guilds.cache.find(item => item.name === discordBotConfig.channelName);
      channel.members.cache.forEach(async (discordMember) => {
        await checkForNitroBoost(bot, discordMember, true);
      });
    }
  }
};
