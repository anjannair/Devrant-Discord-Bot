const { Command } = require('discord.js-commando');
const index = require('../index');
const bot = index.client;
module.exports = async member => {
    const lag = bot.emojis.cache.get("764808105653043202");
    if (member.user.bot) return;

    var channel = member.guild.channels.cache.find(ch => ch.id === process.env.WELCOME);
    if (!channel) return;

    channel.send(`Sob-sob... ${member.user.tag} has left the server ${lag}`);
};
module.exports.help = {
    event: 'guildMemberRemove'
};