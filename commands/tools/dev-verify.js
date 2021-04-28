const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const Discord = require("discord.js");
const apiurl = require("./rantapi.js")


module.exports = class verify extends Command {
    constructor(client) {
        super(client, {
            name: 'verify',
            group: 'tools',
            memberName: 'verify',
            description: 'Verify yourself on devRant and get the verified role',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 30,
            },
            clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS']
        });
    }

    async fetchDRUserID(username) {
        const response = await fetch(`${apiurl.url}/get-user-id?app=3&username=${username}`);
        return response.json();
    }
    async fetchDRUser(id) {
        const response = await fetch(`${apiurl.url}/users/${id}?app=3`);
        return response.json();
    }

    async run(message) {
        const memberVerifiedRole = message.member.roles.cache.get(process.env.VERIFIED);
        if (memberVerifiedRole) {
            return message.reply({
                embed: {
                    title: `No need for this! 🙌`,
                    description: `You have ${memberVerifiedRole} already.`
                }
            });
        }

        let username = message.member.displayName;
        let { user_id } = await this.fetchDRUserID(username);
        if (!user_id) {
            message.reply(`There is no user by name \`${username}\` on devRant. Please type your devrant.com username below...`);
            const input = await message.channel.awaitMessages(({ cleanContent }) => {
                return !/\s/g.test(cleanContent);
            }, { max: 1, time: 60000, errors: ['time'] });

            ({ user_id } = await this.fetchDRUserID(username));
            if (!user_id) {
                return message.channel.send(
                    `Sorry, ${message.author}. I can't verify this name too. Type \`*verify\` when you're a little... mmmmm... assured!`
                );
            }
            username = input.first().cleanContent;
        }
        message.member.setNickname(username);

        const code = Math.random().toString(36).slice(2, 8);
        const token = `-connect+discord+${code}-`;

        const tickEmoji = "✅";
        const doneKeyword = "done";
        const tokenMessage = await message.reply(
            `To verify connection, send following *token* as part of a last comment anywhere on devRant: \`\`\`${token}\`\`\``,
            {
                embed: {
                    title: `📨 You can send it __in our collab__`,
                    description: `Press ${tickEmoji} or type __**\`${doneKeyword}\`**__ below once you send the token.`,
                    url: `https://devrant.com/collabs/${process.env.MAINRANT}`
                }
            }
        );
        tokenMessage.react(tickEmoji);

        for (let i = 2; i >= 0; i--) {
            try {
                await Promise.race([
                    tokenMessage.awaitReactions(({ emoji: { name } }, user) => {
                        return name === tickEmoji && user.id === message.author.id;
                    }, { max: 1, time: 120000, errors: ['time'] }),
                    message.channel.awaitMessages(({ author, cleanContent }) => {
                        return cleanContent.toLowerCase() === doneKeyword && author.id === message.author.id;
                    }, { max: 1, time: 120000, errors: ['time'] })
                ])
            } catch (_) {
                return message.channel.send(`I can't wait too long. Please call this command again once you are ready.`);
            }

            const userData = await this.fetchDRUser(user_id);
            const body = userData.profile?.content?.content?.comments[0]?.body;
            if (body && body.indexOf(token) > -1) break;
            else if (i) {
                message.reply(`Token was not found in the last comment. Try again.`);
            } else {
                return message.reply(`Post a comment containing the token on devrant.com for me to work with.\nOnce you are ready to repeat, type \`*verify\`.`);
            }
        };

        const unverifiedRole = message.guild.roles.cache.get(process.env.UNVERIFIED);
        const verifiedRole = message.guild.roles.cache.get(process.env.VERIFIED);
        if (unverifiedRole) message.member.roles.remove(unverifiedRole);
        if (verifiedRole) {
            message.member.roles.add(verifiedRole);
            return message.reply({
                embed: {
                    title: `You are awesome! 😉`,
                    description: `Get ${verifiedRole}.`,
                    thumbnail: {
                        url: message.guild.iconURL({ size: 32 })
                    }
                }
            });
        }
    }
};