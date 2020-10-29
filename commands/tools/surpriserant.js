const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');
const Discord = require("discord.js");
const apiurl = require("./rantapi.js")

module.exports = class verify extends Command {
	constructor(client) {
		super(client, {
			name: 'rant',
			group: 'tools',
			memberName: 'rant',
            description: 'Fetches a random rant aka surprise rant from devrant',
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
        let rantfetcher = `${apiurl.url}/devrant/rants/surprise?app=3`
        let response = await fetch(rantfetcher);
        let data = await response.json();
        if(data.rant.tags){
            tags = data.rant.tags.join(",")
        }
        const embed = new Discord.MessageEmbed()
            .setColor('#FF7F50')
            .setTitle(`Rant by ${data.rant.user_username}`)
            .setDescription(data.rant.text)
            .addField("Upvotes: ",data.rant.score)
            .setThumbnail(`${apiurl.avatar}/${data.rant.user_avatar.i}`)
            .setImage(data.rant.attached_image.url)
            .setFooter(tags);
    message.say(embed);
    }
}