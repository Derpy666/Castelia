const errors = require('../utils/errors.js');

module.exports.run = async (bot, message, args) => {
  if (message.channel.type === 'dm') {
    message.author.send('You cannot run the !say command in a DM!');
    return;
  }
  message.delete();
  if (!message.member.permissions.has('MANAGE_MESSAGES')) return errors.noPerms(message, 'MANAGE_MESSAGES');
  const botmessage = args.join(' ');
  message.channel.send(botmessage);
};

module.exports.help = {
  name: 'say',
};
