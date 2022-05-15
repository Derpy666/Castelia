const errors = require('../utils/errors.js');

module.exports.run = async (bot, message, args) => {
  if (message.channel.type === 'dm') {
    message.author.send('You cannot run the !clear command in a DM!');
    return;
  }
  await message.delete();
  if (!message.member.permissions.has('MANAGE_MESSAGES')) return errors.noPerms(message, 'MANAGE_MESSAGES');
  if (args[0] === 'help' || args.length < 1) {
    message.author.send('Usage: !clear <amount 1-100>');
    return;
  }
  let amountToClear = 1;
  if (args[0]) {
    if (args[0] < 0 || args[0] > 100) {
      return message.author.send('Can only clear between 1 and 100 messages at a time.');
    }
    [amountToClear] = args;
  }
  message.channel.bulkDelete(amountToClear).then(() => {
    message.author.send(`Cleared ${amountToClear} messages in ${message.channel}.`);
  });
};

module.exports.help = {
  name: 'clear',
};
