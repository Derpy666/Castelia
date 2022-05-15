const axios = require('axios');
const { baseAPIUrl } = require('../../settings/index');
const { discordBot } = require('../../settings/config');
const { abbreviations: jobAbbreviations } = require('../../jobs/abbreviations');

const checkDiscordNickname = async (member, isAnUpdate) => {
  if (member.nickname) {
    let ign = member.nickname;
    if (!isAnUpdate && member.nickname.startsWith('!')) {
      ign = member.nickname.substring(1);
    } else if (ign.includes('-')) {
      const indexOfDash = member.nickname.indexOf('-');
      ign = member.nickname.substring(0, indexOfDash).trim();
    } else {
      return;
    }

    if (ign) {
      try {
        const ignDetailsResult = await axios.post(`${baseAPIUrl}/discord/character`, {
          ign,
        });
        if (ignDetailsResult.status !== 204) {
          try {
            const {
              level, job, overallRank, oddJobName,
            } = ignDetailsResult.data.result;
            const ignWithDash = `${ign} -`;
            let formattedInfo = `Lv ${level} ${jobAbbreviations[job].name}`;
            if (oddJobName) {
              formattedInfo = `Lv ${level} ${oddJobName}`;
            }
            const formattedInfoWithRank = `${formattedInfo} #${overallRank}`;
            const fullFormattedInfo = `${ignWithDash} ${formattedInfoWithRank}`;
            if (fullFormattedInfo.length > 32 || overallRank === 0) {
              member.setNickname(`${ignWithDash} ${formattedInfo}`);
            } else {
              member.setNickname(fullFormattedInfo);
            }
          } catch (err) {
            console.log(err);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
};

module.exports = async (bot, member) => {
  if (member) {
    await checkDiscordNickname(member);
  } else {
    const channel = bot.guilds.cache.find(item => item.name === discordBot.channelName);
    channel.members.forEach(async (discordMember) => {
      await checkDiscordNickname(discordMember, true);
    });
  }
};
