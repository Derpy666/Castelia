const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
  if (!message.channel.type === 'dm') {
    message.delete();
  }
  const osmServerDescription = 'Old School Maple is a MapleStory private server which aims to provide the most authentic and nostalgic GMS circa 2005-2007 MapleStory experience. Back in the days when there was no 4th job, leeching/HP washing, unbalanced content, etc.';
  const serverEmbed = new Discord.MessageEmbed()
    .setColor('#15f153')
    .setThumbnail('https://i.imgur.com/UXkyX2E.png')
    .addField('What is Old School Maple?', osmServerDescription)
    .addField('What is your website?', 'https://oldschoolmaple.com/')
    .addField('Do you have a forum?', 'Yes! https://forum.oldschoolmaple.com/')
    .addField('Do you have a library of your mobs and items?', 'We do! https://lib.oldschoolmaple.com/')
    .addField('Is there an FAQ page I can read?', 'Sure! Use !faq or visit https://faq.oldschoolmaple.com/')
    .addField('What commands can I run in the Discord?', 'You can type !commands to see the full list!');

  message.author.send({ embeds: [serverEmbed] });
};

module.exports.help = {
  name: 'serverinfo',
};
