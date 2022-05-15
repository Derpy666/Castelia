const Discord = require("discord.js")
const fetch = require("node-fetch");
const beautify = require("beautify")
const fs = require("fs")
const secrets = [process.env.TOKEN];
const replaceSecrets = (str, hid = "Hidden") => {
  secrets.forEach(s => {
    if (s) str = str.replace(s, hid);
  });
  return str;
};
const resEmbed = new Discord.MessageEmbed();

module.exports.run = async (bot, message, args) => {

let devs = ["388320576407863297"]

                if(!devs.includes(message.author.id)) return;

                let codein = args.join(" ");

const { guild, member, member: { user } } = message
const guildMember = (id) => guild.member(id);
const User = (id) => guild.member(id).user;

resEmbed.fields = [];
  let code
    let type;

    try {
      code = eval(codein);
      type = code && code.constructor ? code.constructor.name : typeof code;
    } catch (err) {
      code = err.toString();
      type = err.name;
    }

    if (type === "Promise") {
      code = await code;
      type = code && code.constructor ? code.constructor.name : typeof code;
    }

    if (typeof code !== "string")
      code = require("util").inspect(code, { depth: 0, maxArrayLength: null });
    code = code.replace(/`/g, "`\u2004");

    const output = `\`\`\`js\n${replaceSecrets(code)}\n\`\`\``;
    if (output.length > 1024) {
      let url = await hastebin.post(code)
      await message.reply(`${url}.js`)
    } else await message.reply(output)

}

module.exports.help = {
name: "eval"
}
