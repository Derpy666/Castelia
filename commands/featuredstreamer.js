const Discord = require('discord.js');

module.exports.run = async (bot, message) => {
  if (!message.channel.type === 'dm') {
    message.delete();
  }
  const serverEmbed = new Discord.MessageEmbed()
    .setColor('#15f153')
    .setThumbnail('https://i.imgur.com/UXkyX2E.png')
    .setDescription('Issue with running OSM?')
    .addField('Step 1', 'Delete the OSM files you have installed / extracted (including all folders and the launcher. You can remove the launcher version VIA "add or remove programs in the Windows control panel) Then, restart your computer.')
    .addField('Step 2', 'Create a new folder and name it OSM Game. Place the folder into your Documents folder.')
    .addField('Step 3', 'Exclude that folder from your antivirus program (add it as an exception).')
    .addField('Step 4', 'Download the latest version of OSM using this link: <https://client.oldschoolmaple.com> (If you have, skip this step).')
    .addField('Step 5', 'Extract all the files into the folder you created in step 2.')
    .addField('Step 6', 'If you receive a message from antivirus about finding a threat, click on the notification and wait for the program to quarantine the threat.')
    .addField('Step 7', 'Allow the threat and try moving the blocked files again.')
    .addField('Step 8', 'Run the .exe as an administrator.');
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
  name: 'launchhelp',
};
