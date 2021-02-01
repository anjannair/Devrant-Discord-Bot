module.exports = async member => {
    if (member.user.bot) return;

    var channel = member.guild.channels.cache.find(ch => ch.id === process.env.WELCOME);
    if (!channel) return;

    channel.send(`Sob-sob... ${member.user.tag} has left the server :lag:`);
};
module.exports.help = {
    event: 'guildMemberRemove'
};