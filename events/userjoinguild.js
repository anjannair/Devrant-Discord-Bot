const Discord = require("discord.js");
const index = require("../index");
const bot = index.client;
require("dotenv").config();
module.exports = {
  event: "guildMemberAdd", // Name of the event
  oneTime: false, // If set to true the event will only be fired once until the client is restarted
  run: async (member) => {
    const fire = bot.emojis.cache.get("764807476696055839");
    if (member.user.bot) return;
    var channel = member.guild.channels.cache.find(
      (ch) => ch.id === process.env.WELCOME
    );
    if (!channel) return;
    channel.send(`Hello, ${member}! We are glad to see you at dRCS ${fire}`);

    var embs = new Discord.MessageEmbed()
      .setColor("#FF7F50")
      .setTitle(`Welcome to the devRant Community Server (dRCS)!`)
      .setDescription(
        `Please familiarize with the <#${process.env.RULES}>\n\n**Optionally you can verify your devRant identity on the <#${process.env.SPAM}> channel by using \`*verify\` command!**\n\nThank you and have a great time!!`
      );
    member.send(embs).catch((err) => {
      return;
    });
  },
};
