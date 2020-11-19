const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const Discord = require("discord.js");
const apiurl = require("./rantapi.js")

module.exports = class verify extends Command {
    constructor(client) {
        super(client, {
            name: 'nick',
            aliases: ['changenick', 'nickchange', 'nickname'],
            group: 'tools',
            memberName: 'nick',
            description: 'Change your nickname using this command',
            guildOnly: true,
            clientPermissions: ['CHANGE_NICKNAME', 'MANAGE_NICKNAMES'],
            userPermissions: ['CHANGE_NICKNAME'],
            args: [{
                key: 'nickname',
                prompt: 'What do you want to change your nickname to?',
                type: 'string',
            }]
        });
    }

    async run(message, { nickname }) {
        let jad;
        message.member.setNickname(nickname).catch(err => {
            jad = err;
            return message.reply("Sorry I cannot change your nickname");
        });
        if (!jad) {
            message.reply("Done!");
        }
    }
}