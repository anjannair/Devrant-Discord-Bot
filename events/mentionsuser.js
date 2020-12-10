const discord = require("discord.js");
var memjs = require('memjs');
require('dotenv').config();
var store = memjs.Client.create(process.env.MEMCACHEDCLOUD_SERVERS, {
    username: process.env.MEMCACHEDCLOUD_USERNAME,
    password: process.env.MEMCACHEDCLOUD_PASSWORD
});

module.exports = async message => {
    try{
    if (message.mentions.members.first()) {
        if (message.author.bot) return;
        store.get(message.mentions.members.first().id, function (err, value, key) {
            if (value != null) {
                if (value.toString().toLowerCase() == "on") {
                    message.reply(message.mentions.members.first().displayName + " is currently AFK!\nBut your message has been forwarded to him").then(msg => msg.delete({ timeout: 10000 }));
                    const embed = new discord.MessageEmbed()
                        .setTitle("New message when you were AFK")
                        .setColor('#228B22')
                        .setDescription(message.content)
                        .setFooter(`Message from ${message.author.tag} in ${message.guild.name}`, `${message.author.avatarURL({ dynamic: true })}`);
                    message.mentions.members.first().send(embed);
                }
                else {
                    return;
                }
            }
        });
    }
}catch(err){
    
}
};

module.exports.help = {
    event: 'message'
};
