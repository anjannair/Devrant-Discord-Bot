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

    async run(message) {

        //checking if already verified
        let alreadyverified = message.member.roles.cache.find(role => role.id === process.env.VERIFIED)
        const alreadyverifembed = new Discord.MessageEmbed()
            .setColor('#00FF00')
            .setDescription("__You are already verified!__\n\nPro tip: Use `*rant` to see rants from devRant")
            .setFooter("Enjoy", "https://emoji.gg/assets/emoji/9192_random_tick.png");
        if (alreadyverified) return message.reply(alreadyverifembed)

        //creating captcha
        const captcha = Math.random().toString(36).slice(2, 8);
        let rantcommentid;  //to verify if comment in main post
        let rantbody;   //to verify the captcha

        //getting the userID by name
        let userid;
        let idfetcher = `${apiurl.url}/get-user-id?app=3&username=${message.member.displayName}`;
        let response = await fetch(idfetcher);
        let data = await response.json();

        //checking for invalid username
        if (!data.user_id) return message.reply("__Your username or nickname on Discord does not match the one on devRant!__\n\nPro tip: To change your nickname just use the `*nick` command")
        userid = data.user_id;

        const embed = new Discord.MessageEmbed()
            .setColor('#FF7F50')
            .setDescription(`-connect+discord+${captcha}-`);
        message.author.send(embed);    //sends the captcha

        try {
            const msg = await message.reply("Sent you the verification token\n\nNow head to devRant and comment the token in the format sent (\`-connect+discord+TOKEN-\`) on the main post\n\nLink: https://devrant.com/collabs/3221539/devrant-community-server-in-discord\n\n**ENSURE IT'S YOUR RECENT COMMENT\nAFTER YOU FINISH COMMENTING THE TOKEN TYPE \`DONE\` HERE**");

            try {
                const filter = m => {
                    if (m.author.bot) return;
                    if (m.author.id === message.member.id && m.content.toLowerCase() === "done") return true;
                    if (m.content.toLowerCase() != "done" && m.author.id === message.member.id) {
                        m.say('Please type \`DONE\`');
                        return false;
                    }
                    else {
                        return false;
                    }
                };

                const response = await msg.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time'] });
                if (response) {
                    //getting the latest comment by ID
                    let commentfetcher = `${apiurl.url}/users/${userid}?app=3`
                    let response2 = await fetch(commentfetcher);
                    let data2 = await response2.json();
                    rantbody = data2.profile.content.content.comments[0].body;
                    rantcommentid = data2.profile.content.content.comments[0].rant_id;

                    //checks for rant and token in rant
                    const notfoundrantcommentid = new Discord.MessageEmbed()
                        .setColor("#FF0000")
                        .setDescription("Your recent comment is not in the link provided\nAborting....");

                    const notfoundrantbody = new Discord.MessageEmbed()
                        .setColor("#FF0000")
                        .setDescription("Couldn't find the token\nEnsure your recent comment was the token")

                    if (rantcommentid != process.env.MAINRANT) return message.author.send(notfoundrantcommentid);
                    if (rantbody != `-connect+discord+${captcha}-`) return message.author.send(notfoundrantbody);

                    //finding the role
                    let verified = message.member.guild.roles.cache.find(role => role.id === process.env.VERIFIED);
                    let unverified = message.member.guild.roles.cache.find(role => role.id === process.env.UNVERIFIED);
                    if (verified) {
                        message.member.roles.add(verified).catch(err => {
                            return message.reply("I do not have permissions to add the role to you😭")
                        });
                        message.member.roles.remove(unverified);
                        const verifembed = new Discord.MessageEmbed()
                            .setColor('#00FF00')
                            .setDescription("You have been verified\n\n")
                            .setFooter("Signing off", "https://emoji.gg/assets/emoji/9192_random_tick.png");
                        message.author.send(verifembed);
                    }
                    if (!verified) console.log("No verified tag");
                }
            }
            catch (err) {
                console.log(err);
            }
        }
        catch (err) {
            console.log(err);
        }
    }
};