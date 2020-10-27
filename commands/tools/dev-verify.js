const { Command } = require('discord.js-commando');
var devRant = require('rantscript');

//basic command to test
module.exports = class welcome extends Command {
	constructor(client) {
		super(client, {
			name: 'verify',
			group: 'tools',
			memberName: 'verify',
            description: 'Verify yourself on devRant and get the verified role',
            // throttling: {
            //     usages: 1,
            //     duration: ,
            // },
		});
	}

	async run(message) {
        const captcha = Math.random().toString(36).slice(2, 8);
        //console.log(message.member.displayName);
        let rantcommentid;  //to verify if comment in main post
        let rantbody;
        let error;
        await devRant
            .profile(message.member.displayName)
            .then((response)=>{
                rantcommentid = response.content.content.comments[0].rant_id;
                rantbody = response.content.content.comments[0].body;
            })
            .catch((err)=>{
                error = err;
            })
        if(error) return message.reply("Your username or nickname doesn't match with the one on devRant\nOR\nYou have no comments")
        message.author.send(`-connect+discord+${captcha}-`);    //sends the captcha
        message.reply("Sent you the code\n\nNow head to devRant and comment the token in the format sent (\`-connect+discord+TOKEN-\`) on the main post\n\nLink: https://devrant.com/collabs/3221539/devrant-community-server-in-discord\n\n**ENSURE IT'S YOUR RECENT COMMENT\nAFTER YOU FINISH COMMENTING THE TOKEN TYPE \`DONE\`**");
        message.channel.awaitMessages(m => m.author.id == message.author.id, //waits for 30 minutes and the tries
            {max: 1, time: 1800000}).then(collected => {
                if (collected.first().content.toLowerCase() == 'done') {
                    console.log("hmm");
                    console.log(rantcommentid+" "+rantbody)
                    if(rantcommentid != "2924805") return message.author.send("Your recent comment is not in the link provided\nAborting....");//3221539
                    if(rantbody != `-connect+discord+${captcha}-`) return message.author.send("Couldn't find the token");
                    let verified = member.guild.roles.cache.find(role => role.name === `test`);//change this
				    if(verified) member.roles.add(verified);
			    	if(!verified) console.log("No unverified tag");
                }
            }).catch(() => {
            message.reply('No answer after 30 minutes, operation cancelled.');
            });
	}
};