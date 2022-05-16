const Discord = require('discord.js');

module.exports = {
	data: {
                name: 'commands',
                description: 'show list commands',
              },
	async execute(bot, interaction, args) {

const servedEmbed = new Discord.MessageEmbed()
    .setColor('#15f153')
    .setThumbnail('https://i.imgur.com/UXkyX2E.png')
    .setDescription("OSM's Discord Commands")
    .addField('!serverinfo', 'Display a quick breakdown of what OSM is all about.')
    .addField('!myreferral', 'Display your referral link if you have connected your IGN to your nickname.')
    .addField('!faq', 'Read about our most frequently asked questions.')
    .addField('!newplayer', 'Display some frequently asked questions about the server and OSM!')
    .addField('!ign <character name>', 'Have **Bob the Snail** track your OSM level, job, and rank!')
    .addField('!featuredstreamer', 'Learn more about how you can stream OSM and even earn FREE Maple Cash from doing so!')
    .addField('!launchhelp', 'Get a list of steps that might help you launch OSM if you\'re running into issues!')
    .addField('!report <user> <reason>', 'Is someone harassing you or being toxic? Report the user and one of the staff will take proper measures.')
    .addField('!servertime', 'Display the server time of OSM.')
    .addField('!setnitroboostacc <ign>', 'If you Nitro Boost OSM\'s Discord, you will **earn 3,000 Maple Cash every week!** That\'s **12,000 Maple Cash every month**! (More than you would get from donating $10)')
    .addField('!nextnitroboostreward', 'Find out the next time you will receive your Nitro Boost reward!')
    .addField('!joingiveaway', 'Join a running giveaway to win a coupon code!')
    .addField('!commands', 'Display this list of commands.');

  await interaction.reply({ embeds: [servedEmbed] });

if (interaction.member.permissions.has('MANAGE_MESSAGES')) {
    const staffServerEmbed = new Discord.MessageEmbed()
      .setColor('#15f153')
      .setThumbnail('https://i.imgur.com/UXkyX2E.png')
      .setDescription("OSM's Discord Staff Commands")
      .addField('!say <message>', 'Send a message as Bob the Snail.')
      .addField('!clear <amount 1-100>', 'Clear 1 to 100 messages in a channel. Can only delete messages from up to 2 weeks ago.')
      .addField('!mute <user> <1s/m/h/d> <reason>', 'Mute a Discord user for a certain amount of time and state the reaosn why.')
      .addField('!kick <user> <reason>', 'Kick a Discord user and state the reason why.')
      .addField('!ban <user> <reason>', 'Ban a Discord user and state the reason why.')
      .addField('!banstreamer <username>', 'Ban a Twitch streamer from the OSM website and from the Discord streaming role.')
      .addField('!unbanstreamer <username>', 'Unban a Twitch streamer from the OSM website and from the Discord streaming role.')
      .addField('!newvideo <video link>', 'Add a new community video from a YouTube.com URL.')
      .addField('!newservermessage <optional info/error/warning> <"header"> <"content">', 'Add a server message to the top of the website.')
      .addField('!deleteservermessage', 'Remove any server messages on the website.')
      .addField('!newcouponcode <reward amount>', 'Generate a coupon code.')
      .addField('!checkcouponcode <code>', 'Check on the status of a coupon code.')
      .addField('!startgiveaway <reward amount> <optional number of winners>', 'Start a giveaway in #general where winners can redeem a coupon code.')
      .addField('!endgiveaway', 'End a running giveaway and reward the winners.')
      .addField('!cancelgiveaway', 'Cancel a currently running giveaway.')
      .addField('!givevote <ign>', 'Gives a player a manual vote reward.')
      .addField('!featuredstreamer', 'Displays information on how to become a featured streamer.');

    await interaction.followUp({ embeds: [staffServerEmbed], ephemeral: true });
}
}
};
