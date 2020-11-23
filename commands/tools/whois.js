const { Command } = require('discord.js-commando');
const Discord = require("discord.js");

module.exports = class verify extends Command {
    constructor(client) {
        super(client, {
            name: 'whois',
            group: 'tools',
            memberName: 'whois',
            description: 'Conduct a whois to know who the user is incase of an infraction (can be used by admins and moderators only)',
            guildOnly: true,
            args: [{
                key: 'who',
                prompt: 'Whom do you want to know about?',
                type: 'user',
            }]
        });
    }

    async run(message, { who }) {
        //user
        let accountcreatedate = who.createdAt.toString();
        let useravatar = who.displayAvatarURL({ dynamic: true });
        let userpresence = who.presence.status;
        let usertag = who.tag;

        //member
        let guild = message.guild;
        if (guild.member(who.id)) {
            let member = guild.member(who.id);
            let lastmessage;
            let lastmessageid;
            if (who.lastMessage) {
                lastmessage = who.lastMessage.content;
                lastmessageid = who.lastMessageID;
            }
            else {
                lastmessage = "None detected";
                lastmessageid = "None";
            }
            let guildjoin = member.joinedAt.toString();
            let roles = member.roles.cache.map(role => role.name).join(',');

            const embed = new Discord.MessageEmbed()
                .setColor('#FF7F50')
                .setTitle("Whois of " + usertag)
                .addField("Account created on: ", accountcreatedate)
                .addField("Current user activity: ", userpresence)
                .setThumbnail(useravatar)
                .addField("User in this server: ", "true")
                .addField("Joined guild on: ", guildjoin)
                .addField("Roles recieved: ", roles)
                .addField("Last message sent in guild: ", lastmessage)
                .addField("ID of last message sent: ", lastmessageid)
                .setFooter(`Requested by ${message.author.tag}`, `${message.author.avatarURL({ dynamic: true })}`)
                .setTimestamp();

            message.channel.send(embed);

        }
        else {
            const embed = new Discord.MessageEmbed()
                .setColor('#FF7F50')
                .setTitle("Whois of " + usertag)
                .addField("Account created on: ", accountcreatedate)
                .addField("Current user activity: ", userpresence)
                .setThumbnail(useravatar)
                .addField("User in this server: ", "false")
                .setFooter(`Requested by ${message.author.tag}`, `${message.author.avatarURL({ dynamic: true })}`)
                .setTimestamp();

            message.channel.send(embed);
        }

    }
}