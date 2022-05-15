const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
  if (!message.channel.type === 'dm') {
    message.delete();
  }
  const serverEmbed = new Discord.MessageEmbed()
    .setDescription("OSM's Frequently Asked Questions")
    .setColor('#15f153')
    .setThumbnail('https://i.imgur.com/UXkyX2E.png')
    .addField('What are vote streaks?', 'Everytime you vote, you increase your vote streak by a point. If you vote every day, you will keep increasing your vote streak and thus increase the total amount of Maple Cash you obtain from voting! If you miss a day however, your vote streak will reset down to 0!')
    .addField('How do referrals work?', 'Have a friend that is interested in playing OSM? Simply give them your referral link (https://oldschoolmaple.com/?modal=referral) to sign up with and once they reach Lv. 30, both of you will gain 1,000 Maple Cash! It\'s that easy!')
    .addField('How do I become a featured streamer?', 'Simply type !featuredstreamer and Bob will help you out!')
    .addField('I\'m having trouble launching OSM!', 'Simply type !launchhelp and Bob will help you out!')
    .addField('How can I have an automatically updating Discord nickname?', 'By setting your nickname to an IGN in OSM, our Discord bot will automatically track your level, job, and overall rank (Only if there\'s enough room to fit everything in. Otherwise the max character count of a nickname is 32). Simply right click on the OSM Discord server and choose "Change Nickname" and set it to **!IGN** (e.g., !Kyanite) where IGN is the IGN you would like to appear as. It\'s that simple!')
    .addField('How can I support OSM?', 'The best way to support the server is to tell your friends about it! The other best way to support the server is to vote for it every day. If you are generous and have spare income, we would really appreciate a donation to help operate the server and pay bills. Every little bit helps!')
    .addField('Have more FAQ questions?', 'Visit our website to see more: http://faq.oldschoolmaple.com');

  message.author.send({ embeds: [serverEmbed] });
};

module.exports.help = {
  name: 'faq',
};
