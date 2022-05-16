const Discord = require('discord.js');
const schedule = require('node-schedule');
const settings = require('./settings');
const {
  verify, fetch, check, sendWelcome, isA,
} = require('./helpers');
const { discordBot: discordBotConfig } = require('./settings/config');
const fs = require('fs');

const bot = new Discord.Client({
intents: Object.keys(Discord.Intents.FLAGS),
allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
fetchAllMembers:true
});

bot.login(discordBotConfig.token);

bot.commands = new Discord.Collection();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9'); 


const cooldown = new Set();
const cdSeconds = 5;

const rest = new REST({ version: '9' }).setToken(discordBotConfig.token);


let commands = []


fs.readdir('./commands/', (err, files) => {
  if (err) console.log(err);
  const jsfile = files.filter(f => f.split('.').pop() === 'js');
  if (jsfile.length <= 0) {
    console.log('Could not find commands.');
    return;
  }

  /* eslint-disable import/no-dynamic-require, global-require */
  jsfile.forEach((f) => {
    const props = require(`./commands/${f}`);
    console.log(`Loaded ${f}!`);
    if(props.data) commands.push(props.data);
    else bot.commands.set(props.help.name, props);
  });
});

process.on("unhandledRejection", error => {
  console.error("Uncaught Promise Rejection", error);
  console.log("Restarting...");
});

bot.on('ready', async () => {
  console.log(`${bot.user.username} is online on ${bot.guilds.cache.size} servers!`);
  fetch.mutes(discordBotConfig.channelName, bot);
  schedule.scheduleJob(settings.updateDiscordCharacterDetailsEvery, () => {
    verify.nicknames(bot);
  });
  schedule.scheduleJob(settings.checkForStreamersEvery, () => {
    verify.streaming(null, null, bot);
  });
  schedule.scheduleJob(settings.checkForNitroBoostEvery, () => {
    verify.nitroBoost(bot);
  });
});

bot.on('presenceUpdate', async (oldPresence, newPresence) => {
  verify.streaming(oldPresence?.member, newPresence?.member);
});

bot.on('guildMemberAdd', (member) => {
  check.isMuted(member);
  sendWelcome(member, bot);
});

bot.on('guildMemberUpdate', (oldMember, newMember) => {
  verify.nicknames(bot, newMember);
  verify.nitroBoost(bot, oldMember, newMember);
});


bot.on('messageCreate', async (message) => {
  // Remove URLs
  if (message.channel.type !== 'dm' && !message.author.bot && !message.member.permissions.has('MANAGE_MESSAGES') && message.channel.name === 'general' && isA.url(message.content)) {
    message.delete();
    message.author.send('Posting links in **#general** channel is not allowed.');
    return;
  }

  if (message.author.bot && message.author.username !== 'Cody') return;
  let isDirectMessage = false;
  if (message.channel.type === 'dm') {
    isDirectMessage = true;
  }
  try {
    if (message.channel.name === 'transactions' && message.embeds[0].description === 'Donation') {
      verify.donations(bot);
    }
  } catch (err) { /* */ }

  const { prefix } = discordBotConfig;
  if (!message.content.startsWith(prefix)) return;
  if (cooldown.has(message.author.id)) {
    message.delete();
    return message.author.send('You have to wait 5 seconds between commands.');
  }
  if (!isDirectMessage && !message.member.permissions.has('ADMINISTRATOR')) {
    cooldown.add(message.author.id);
  }


  const messageArray = message.content.split(' ');
  const cmd = messageArray[0].toLowerCase();
  const args = messageArray.slice(1);

  const commandfile = bot.commands.get(cmd.slice(prefix.length));
  if (commandfile) commandfile.run(bot, message, args);

  setTimeout(() => {
    cooldown.delete(message.author.id);
  }, cdSeconds * 1000);
});

bot.on('messageUpdate', (oldMessage, newMessage) => {
  // Remove URLs
  if (newMessage.channel.type !== 'dm' && !newMessage.author.bot && !newMessage.member.permisions.has('MANAGE_MESSAGES') && newMessage.channel.name === 'general' && isA.url(newMessage.content)) {
    newMessage.delete();
    newMessage.author.send('Posting links in OSM\'s **#general** channel is not allowed.');
  }
});

bot.on('interactionCreate', async (interaction) => {
  async function handleCommandAutocomplete(client, interaction, args) {

    const command = require(`./commands/${interaction.commandName}`);

    const focused = interaction.options.data.find((option) => option.focused);
    if (!focused) return await interaction.respond([]);

    let autocomplete = await command.autocomplete(interaction, focused);
    if (autocomplete.every((option) => typeof option === 'string'))
        autocomplete = autocomplete.map((a) => ({
            name: a,
            value: a,
        }));
    if (autocomplete.length > 25) autocomplete = autocomplete.slice(0, 25);

    return await interaction.respond(autocomplete);
};

if (interaction.isAutocomplete())
        return await handleCommandAutocomplete(bot, interaction, interaction?.options?._hoistedOptions || []);


if (interaction.isButton()) {
}
if(interaction.isCommand()) {
let cmd = require(`./commands/${interaction.commandName}`)
return await cmd.execute(bot, interaction, interaction?.options?._hoistedOptions || [])
}
});

console.log('Started refreshing application (/) commands.');

	         rest.put(
			Routes.applicationGuildCommands("975258238914269235", "936482657343254528"),
			{ body: commands },
		).then(() => console.log(`Successfully reloaded ${commands.length} application (/) commands.`))


