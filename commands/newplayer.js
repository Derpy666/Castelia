const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
  if (!message.channel.type === 'dm') {
    message.delete();
  }
  const serverEmbed = new Discord.MessageEmbed()
    .setColor('#15f153')
    .setThumbnail('https://i.imgur.com/UXkyX2E.png')
    .setDescription('Here are some tips to familiarize yourself with OSM.')
    .addField('4 Classes', 'Only the original 4 classes are available (Thief, Warrior, Magician, Archer)')
    .addField('3rd Job Only', 'The 4th Job Advancement does not exist here. Nor will it ever exist.')
    .addField('No Down Jump', 'Down jump does not exist in our server because it was not added to GMS for a long time. This is a good thing, however, because it upholds the integrity and value of class mobility.')
    .addField('Progressive EXP', 'The experience rate will change as you level up.')
    .addField('HELP Button', 'Use the in-game HELP button to look at your character, account, and game settings (EXP rate, deaths, Discord connectivity, available fame, and more).')
    .addField('GMS-like Drop Rate', 'We have the most authentic 1x GMS-like drop table out of any other private server. Drops are rare and hard to find but finding them is extremely rewarding!')
    .addField('How to Add Merchandise in #listings', 'When you open a player store, your items will automatically be posted in the channel after a 1-2 hour delay.')
    .addField('How to Price Check an Item in OSM', 'Click on #listings or #sold . Then, on your keyboard, press Ctrl+F and a search bar should be active in the top right. Type in the desired item to see how much it sells for.')
    .addField('How to Purchase a Pet', 'In order to not be Vote/Pay-To-Win there are two Meso Pets sold for 1,000,000 Mesos from the Mesos tab in the Cash Shop. The pets in the normal Pet tab are unavailable unless you have purchased one of the two Meso Pets.')
    .addField('Announcements', 'Events, server status, and content updates will be posted on the forums and Discord server.');
  try {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      message.author.send({ embeds: [serverEmbed] });
    } else {
      message.channel.send({ embeds: [serverEmbed] });
    }
  } catch (ex) {
    message.author.send({ embeds: [serverEmbed] });
  }
};

module.exports.help = {
  name: 'newplayer',
};
