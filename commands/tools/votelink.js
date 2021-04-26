const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
//send links to upvote
module.exports = class ping extends Command {
    constructor(client) {
        super(client, {
            name: 'link',
            group: 'tools',
            aliases: ['send'],
            memberName: 'link',
            description: 'Send links to take votes for (mod only)',
            guildOnly: true,
            args: [{
                key: "title",
                prompt: "What is the title?",
                type: "string"
            },
            {
                key: "description",
                prompt: "What is the description?",
                type: "string"
            },
            {
                key: "link",
                prompt: "What is the link?",
                type: "string"
            },
            {
                key: "user",
                prompt: "Who suggested the link?",
                type: "member"
            }
            ]
        });
    }

    async run(message, { title, description, link, user }) {
        const embed = new Discord.MessageEmbed()
            .setColor('#FF7F50')
            .setTitle(title)
            .setURL(link)
            .setDescription(description)
            .setFooter(`Suggested by ${user.displayName}`)
            .setTimestamp();
        
        message.channel.send(embed).then(embedMessage => {
            embedMessage.react("👍").then(() => embedMessage.react('👎'))
        });
    }
};