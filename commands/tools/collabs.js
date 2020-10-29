const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const Discord = require("discord.js");
const apiurl = require("./rantapi.js")

module.exports = class verify extends Command {
	constructor(client) {
		super(client, {
            name: 'collab',
            aliases: ['collabs','collab-rant'],
			group: 'tools',
			memberName: 'collab',
            description: 'Fetches known collaborations on devRant',
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
        let collabfetcher = `${apiurl.url}/devrant/collabs?app=3`
        let response = await fetch(collabfetcher);
        let data = await response.json();
        let collabnumber = data.rants[Math.floor(Math.random() * data.rants.length)];
        if(collabnumber.tags){
            tags = collabnumber.tags.join(",")
        }
        const embed = new Discord.MessageEmbed()
            .setColor('#FF7F50')
            .setTitle(`Collaboration by ${collabnumber.user_username}`)
            .setDescription(collabnumber.text)
            .addField("Upvotes: ",collabnumber.score)
            .addField("Link to collab: ",`${apiurl.main}/${collabnumber.link}`)
            .setThumbnail(`${apiurl.avatar}/${collabnumber.user_avatar.i}`)
            .setImage(collabnumber.attached_image.url)
            .setFooter(tags);
    message.say(embed);
    }
}