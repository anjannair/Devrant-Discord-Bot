const discord = require("discord.js");

module.exports = async guild => {
	let defaultChannel = "";
    guild.channels.cache.forEach((channel) => {
    if(channel.type == "text" && defaultChannel == "") {
    if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
      defaultChannel = channel;
    }
  }
});
//defaultChannel will be the channel object that the bot first finds permissions for
let embed = new discord.MessageEmbed()
    .setTitle("Thank You For Adding Me")
    .setDescription('My default prefix is *\n\nFor more commands use \`*help\`')
    .setTimestamp();
defaultChannel.send(embed);
};
module.exports.help = {
	event: 'guildCreate'
};