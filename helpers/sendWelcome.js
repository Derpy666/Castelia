const Discord = require('discord.js');
const { discordBot: discordBotConfig } = require('../settings/config');

const { green } = discordBotConfig;

module.exports = (member) => {
  member.user.send(new Discord.MessageEmbed()
    .setColor(green)
    .setThumbnail('https://i.imgur.com/UXkyX2E.png')
    .setDescription(`Welcome to OSM <@!${member.id}>! You can type **!commands** to see what I'm capable of!`)
    .addField('Terms & Conditions', 'Please read, respect, and follow OSM\'s ToS: <https://forum.oldschoolmaple.com/threads/terms-conditions.414/>.')
    .addField('Forum', 'Feel free to checkout our forums (<https://forum.oldschoolmaple.com>) to get the latest announcement and updates.')
    .addField('New Players', 'Type **!newplayer** if you\'re new to OSM and wish to get a list of helpful tips!')
    .addField('Helpful Tips & Guides', 'We strongly advise you to read the the following guides to help you get started on your OSM journey:\n<https://forum.oldschoolmaple.com/threads/welcome-to-osm.591>\n<https://forum.oldschoolmaple.com/threads/a-beginners-guide-to-osm.619>')
    .addField('Introduce Yourself', 'Feel free to introduce yourself and say hi to everyone: <https://forum.oldschoolmaple.com/forums/introductions-farewells.27>')
    .addField('Nitro Boosting', 'If you Nitro Boost OSM\'s Discord, you can **earn 3,000 Maple Cash every week for FREE** that you keep boosting! That\'s **12,000 Maple Cash a month** (More than you would get from donating $10)!\n\nLearn more about our Nitro Boosting Rewards here: <https://forum.oldschoolmaple.com/threads/introducing-nitro-boosting-rewards.998/>')
    .setTimestamp(new Date().getTime()));
};
