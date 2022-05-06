const Discord = require("discord.js");
const index = require("../index");
const bot = index.client;
require("dotenv").config();
module.exports = {
  event: "guildMemberRemove", // Name of the event
  oneTime: false, // If set to true the event will only be fired once until the client is restarted
  run: async (member) => {
    const lag = bot.emojis.cache.get("764808105653043202");
    if (member.user.bot) return;

    var channel = member.guild.channels.cache.find(
      (ch) => ch.id === process.env.WELCOME
    );
    if (!channel) return;

    channel.send(`Sob-sob... ${member.user.tag} has left the server ${lag}`);
  },
};
