const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const Discord = require("discord.js");
const apiurl = require("./rantapi.js")

module.exports = class verify extends Command {
	constructor(client) {
		super(client, {
            name: 'story',
            aliases: ['devrant-story','devstory','rantstory','story-rants'],
			group: 'tools',
			memberName: 'story',
            description: 'Fetches top stories from devRant',
            guildOnly: true,
            clientPermissions: ['EMBED_LINKS'],
            throttling: {
                usages: 2,
                duration: 20,
            },
		});
    }

    async run(message) {
        var tags=" ";
        let storyfetcher = `${apiurl.url}/devrant/story-rants?app=3`
        let response = await fetch(storyfetcher);
        let data = await response.json();
        let storynumber = data.rants[Math.floor(Math.random() * data.rants.length)];
        if(storynumber.tags){
            tags = storynumber.tags.join(",")
        }
        const embed = new Discord.MessageEmbed()
            .setColor('#FF7F50')
            .setTitle(`Story by ${storynumber.user_username}`)
            .setDescription(storynumber.text)
            .addField("Upvotes: ",storynumber.score)
            .setThumbnail(`${apiurl.avatar}/${storynumber.user_avatar.i}`)
            .setImage(storynumber.attached_image.url)
            .setFooter(tags);
    message.say(embed);
    }
}