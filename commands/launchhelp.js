const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
  if (!message.channel.type === 'dm') {
    message.delete();
  }
  const serverEmbed = new Discord.MessageEmbed()
    .setColor('#15f153')
    .setThumbnail('https://i.imgur.com/UXkyX2E.png')
    .setDescription('How do I become a featured streamer?')
    .addField('Streaming Title', 'To become a featured OSM streamer, simply have your stream title begin with [OSM]. That\'s it!')
    .addField('Streaming Status', 'Make sure that on Discord, you appear as streaming (Username becomes purple and your status says Streaming X). To do this you will need to connect your streaming account (Most likely your Twitch account) and Discord will automatically detect whether or not you\'re streaming!')
    .addField('Disconnect other Connections', 'Some players have issues where other connected services (like Spotify) overtake the status of your Discord and thus you never show up as streaming. To fix this, please disconnect such services if you are having issues.')
    .addField('Earn Maple Cash', 'You can earn Maple Cash for every hour that you stream OSM! Check out our streaming incentives here: <https://forum.oldschoolmaple.com/threads/introducing-streaming-incentives.309/>');
  try {
    if (!message.member.hasPermission('MANAGE_MESSAGES')) {
      message.author.send({ embeds: [serverEmbed] });
    } else {
      message.channel.send({ embeds: [serverEmbed] });
    }
  } catch (ex) {
    message.author.send({ embeds: [serverEmbed] });
  }
};

module.exports.help = {
  name: 'featuredstreamer',
};
