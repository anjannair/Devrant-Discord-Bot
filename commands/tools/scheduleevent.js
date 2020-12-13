const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const Discord = require("discord.js");
//const mongoose = require('mongoose');

const emojis = ['💻', '🖥', '📱', '⌨'];

module.exports = class verify extends Command {
    constructor(client) {
        super(client, {
            name: 'schedule',
            aliases: ['schedulevent', 'event'],
            group: 'tools',
            memberName: 'schedule',
            description: 'Send event information to interested members!',
            guildOnly: true,
        });
    }

    async run(message) {
        //checks if user is event manager
        let eventmanager = message.member.roles.cache.find(role => role.id === process.env.MANAGER);
        if (!eventmanager) return message.reply("You are not an event manager!");

        //Start taking details

        //Event name
        message.reply("What is the event name? (Keep it short)");
        var event;
        var about_event;
        var timezone_abbr;
        var time;
        try {
            const filter = m => {
                if (m.author.bot) return false;
                else return true;
            };
            event = await message.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time'] });
            if (event) {
                message.channel.send("Event name set");
            }
        } catch (err) {
            return message.reply("Event name setting cancelled");
        }

        //Event information
        message.reply("Enter what is the event about? (Include as much information as possible, restricted to Discord's maximum message length policy)");
        try {
            const filter = m => {
                if (m.author.bot) return false;
                else return true;
            };
            about_event = await message.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time'] });
            if (about_event) {
                message.channel.send("About event set");
            }
        } catch (err) {
            return message.reply("About event setting cancelled");
        }

        //Timezone input
        message.reply("Enter your timezone");
        try {
            const filter = async m => {
                if (m.author.bot) return;
                let timezone = await fetch('https://raw.githubusercontent.com/dmfilipenko/timezones.json/master/timezones.json');
                let data = await timezone.json();
                let ck = 0;
                for (var i = 0; i < data.length; i++) {
                    if (m.content == data[i].abbr) { ck++; break; }
                }
                if (ck > 0) {
                    return true;
                }
                else {
                    m.reply("You entered a wrong time-zone! Try again\nPro tip: Refer Google for your time zone abbreviation");
                    return false;
                }
            };
            timezone_abbr = await message.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time'] });
            if (timezone_abbr) {
                message.channel.send("Time Zone set");
            }
        } catch (err) {
            return message.reply("Time zone setting cancelled");
        }

        //Time of the event
        message.reply("What time? (24 hr format)");
        try {
            const filter = async m => {
                if (m.author.bot) return false;
                else return true;

            };
            time = await message.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time'] });
            if (time) {
                message.channel.send("Time set");
            }
        } catch (err) {
            return message.reply("Time setting cancelled");
        }

        //Finally sending the message
        const embed = new Discord.MessageEmbed()
            .setTitle(event.map(m => m.content))
            .setColor('#FF7F50')
            .addField("What is event about?", about_event.map(m => m.content))
            .addField("When is it?", time.map(m => m.content) + " " + timezone_abbr.map(m => m.content))
            .setFooter(`${emojis[Math.floor(Math.random() * emojis.length)]} Hope to see you there!\nIncase of doubts contact ${message.member.displayName}`);



        //Checking if user is satisfied with the setup
        message.reply("Is this the final message?")
        message.channel.send(embed).then(m => {
            m.react('✔️');
            m.react('❌');
            const newfilter = (reaction, user) => {
                return ['✔️', '❌'].includes(reaction.emoji.name) && user.bot == false && user == message.author;
            };
            m.awaitReactions(newfilter, { max: 1, time: 300000, errors: ['time'] })
                .then(async collected => {
                    const waitreaction = collected.first();
                    if (waitreaction.emoji.name === '✔️') {
                        message.reply(`Alright! Sending the details to #${this.client.channels.cache.get(process.env.DIGEST).name}!`);
                        this.client.channels.cache.get(process.env.DIGEST).send(embed);
                    }
                    if (waitreaction.emoji.name === '❌') {
                        return message.reply("Terminating session..!\nPro tip: Take your time to write the message you have 10 minutes per question!")
                    }
                });
        });


    }
};