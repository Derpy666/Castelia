const Discord = require('discord.js');
const axios = require('axios');
const { baseAPIUrl } = require('../settings/index');

const failedMessage = 'Please set your nickname to an IGN. You can type **!faq** to learn more about how to do that.';
const unableToFindMessage = 'Unable to find your IGN. Are you sure you\'ve set it correctly?';

module.exports.run = async (bot, message) => {
  if (!message.channel.type === 'dm') {
    message.delete();
  }
  try {
    const { nickname } = message.member;
    let ign;
    if (nickname.includes(' - ')) {
      const indexOfCutoff = nickname.indexOf(' - ');
      ign = nickname.substring(0, indexOfCutoff);
      const description = `Use <@!${message.member.id}>'s referral link to sign up! If you **reach level 30**, you both gain **1,000 Maple Cash** for **FREE**!`;
      try {
        const generatedCharImage = await axios.post(`${baseAPIUrl}/generate/character/image`, {
          ign,
        });
        if (!generatedCharImage) {
          message.author.send(unableToFindMessage);
        }
        const accountReferral = await axios.post(`${baseAPIUrl}/generate/account/referral`, {
          ign,
        });
        const referralLink = `https://play.oldschoolmaple.com/?referral=${accountReferral.data.result}`;
        const servedEmbed = new Discord.MessageEmbed()
          .setColor('#15f153')
          .setThumbnail(`${generatedCharImage.data.result}?name=${ign}`)
          .setDescription(description)
          .addField('Referral Link ', referralLink);
        message.channel.send({ embeds: [servedEmbed] });
      } catch (err) {
        message.author.send(unableToFindMessage);
      }
    } else {
      message.author.send(failedMessage);
    }
  } catch (err) {
    message.author.send(failedMessage);
  }
};

module.exports.help = {
  name: 'myreferral',
};
