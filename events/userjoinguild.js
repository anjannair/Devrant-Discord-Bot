const Discord = require("discord.js");

/* No welcome for bots */

module.exports = async (member) => {
    if (member.user.bot) return;
    const fire = this.client.emojis.cache.get("764807476696055839");
    var channel = member.guild.channels.cache.find(ch => ch.id === process.env.WELCOME);
    if (!channel) return;
    channel.send(`Hello, ${member}! We are glad to see you at dRCS ${fire}`);

    var embs = new Discord.MessageEmbed()
        .setColor('#FF7F50')
        .setTitle(`Welcome to ${member.guild.name}`)
        .setDescription(`You are now with ${member.guild.memberCount} members\n\n**Optionally you can verify your devRant identity on the <#${process.env.SPAM}> channel by using \`*verify\` command!**`);
    member.send(embs).catch(err => {
        return;
    });

};
module.exports.help = {
    event: 'guildMemberAdd',
};
