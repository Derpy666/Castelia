const Discord = require('discord.js');
const errors = require('../utils/errors.js');
const moment = require('moment');
const settings = require('../settings');
const pool = require('../database');
const helpers = require('../helpers');
const { discordBot: discordBotConfig } = require('../settings/config');

const { green } = discordBotConfig;

module.exports.run = async (bot, message, args) => {
  try {
    if (message.channel.type === 'dm') {
      message.author.send('You cannot run the !givevote command in a DM!');
      return;
    }
    message.delete();
    if (!message.member.permissions.has('KICK_MEMBERS')) return errors.noPerms(message, 'KICK_MEMBERS');
    if (args[0] === 'help' || args.length !== 1) {
      message.author.send('Usage: !givevote <ign>');
      return;
    }

    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return errors.equalPerms(message, 'MANAGE_MESSAGES');
    }

    const ign = args[0];
    try {
      await pool(async (conn) => {
        const [account] = await conn.query('SELECT a.name as username FROM osm.accounts a JOIN osm.characters c ON a.id = c.accountid WHERE c.name = ?', [ign]);
        if (!account) {
          message.author.send(`Unable to find **${ign}**! Make sure you're providing the IGN.`);
          return;
        }

        const currentDateCST = moment()
          .utc()
          .format(helpers.format.momentDateFormat);
        const endOfDayCST = moment(currentDateCST)
          .endOf('day')
          .toDate();
        const [user] = await conn.query(
          'SELECT id, voteStreak, highestVoteStreak FROM osm.accounts WHERE name = ?',
          [account.username],
        );

        const [latestVoteTimeOfUser] = await conn.query(
          'SELECT date FROM osm.account_cs_transactions WHERE accountid = ? AND automatedtype = ? ORDER BY date DESC LIMIT 1',
          [user.id, settings.automatedType.VOTE],
        );
        let { voteStreak } = user;
        voteStreak += 1;
        if (latestVoteTimeOfUser) {
          const latestVoteTimeInCST = moment(latestVoteTimeOfUser.date)
            .utc()
            .format(helpers.format.momentDateFormat);
          const latestEndOfTheDayForUser = moment(latestVoteTimeInCST).endOf('day');
          const alreadyVoted = moment(endOfDayCST).diff(latestEndOfTheDayForUser, 'days') === 0;
          if (alreadyVoted) {
            const canVoteAt = moment.duration(moment(endOfDayCST).diff(moment(currentDateCST)));
            const canVoteAtHumanized = canVoteAt.humanize();
            message.author.send(`**${ign}** has already voted! They will be able to vote again in **${canVoteAtHumanized}**.`);
            return;
          }

          const lostStreak = moment(endOfDayCST).diff(latestEndOfTheDayForUser, 'days') > 1;
          if (lostStreak) {
            voteStreak = 1;
          }
        }

        if (user.highestVoteStreak < voteStreak) {
          await conn.query('UPDATE osm.accounts SET voteStreak = ?, highestVoteStreak = ? WHERE id = ?', [
            voteStreak,
            voteStreak,
            user.id,
          ]);
        } else {
          await conn.query('UPDATE osm.accounts SET voteStreak = ? WHERE id = ?', [voteStreak, user.id]);
        }

        // User has passed all checks, give them points
        const voteTransaction = {
          accountid: user.id,
          amount: settings.voting.amount(voteStreak),
          note: `Manual vote given by ${message.author.tag} to ${ign}`,
          cashtype: settings.voting.cashtype,
          automatedtype: settings.automatedType.VOTE,
        };
        await conn.query('INSERT INTO osm.account_cs_transactions SET ?', [voteTransaction]);

        message.author.send({ embeds: [new Discord.MessageEmbed()
          .setColor(green)
          .setDescription('Manual Vote Rewarded')
          .addField('IGN', ign)
          .addField('Vote Streak', voteStreak)
          .addField('Previous Highest Vote Streak', user.highestVoteStreak)
          .setTimestamp(message.createdAt)]});
      });
    } catch (err) {
      message.author.send(`Something went wrong: ${err.message}`);
    }
  } catch (err) {
    message.author.send(`Something went wrong: ${err.message}`);
  }
};

module.exports.help = {
  name: 'givevote',
};
