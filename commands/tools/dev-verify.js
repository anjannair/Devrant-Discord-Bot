const { Command } = require('discord.js-commando');
const fetch = require('node-fetch');

module.exports = class verify extends Command {
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
        let rantcommentid;  //to verify if comment in main post
        let rantbody;
        let userid;

        //getting the userID by name
        let idfetcher = `https://devrant.com/api/get-user-id?app=3&username=${message.member.displayName}`;
        let response = await fetch(idfetcher);
        let data = await response.json();
        //checking for invalid username
        if(!data.user_id) return message.reply("Your username or nickname on Discord does not match the one on devRant!")
        userid = data.user_id;

        message.author.send(`-connect+discord+${captcha}-`);    //sends the captcha

        try{
        const msg = await message.reply("Sent you the code\n\nNow head to devRant and comment the token in the format sent (\`-connect+discord+TOKEN-\`) on the main post\n\nLink: https://devrant.com/collabs/3221539/devrant-community-server-in-discord\n\n**ENSURE IT'S YOUR RECENT COMMENT\nAFTER YOU FINISH COMMENTING THE TOKEN TYPE \`DONE\` HERE**");

        try{
            const filter = m => {
                if(m.author.bot) return;
                if(m.author.id === m.member.id && m.content.toLowerCase() === "done") return true;
                else {
                    m.channel.send('Please type Done (case-insensitive)');
                    return false;
                }
            };

            const response = await msg.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time']});
                if(response){
                    //getting the latest comment by ID
                    let commentfetcher = `https://devrant.com/api/users/${userid}?app=3`
                    let response2 = await fetch(commentfetcher);
                    let data2 = await response2.json();
                    rantbody = data2.profile.content.content.comments[0].body;
                    rantcommentid = data2.profile.content.content.comments[0].rant_id;

                    //checks for rant and token in rant
                    if(rantcommentid != process.env.MAINRANT) return message.author.send("Your recent comment is not in the link provided\nAborting....");//3221539
                    if(rantbody != `-connect+discord+${captcha}-`) return message.author.send("Couldn't find the token");

                    //finding the role
                    let verified = message.member.guild.roles.cache.find(role => role.id === process.env.VERIFIED);
                    let unverified = message.member.guild.roles.cache.find(role => role.id === process.env.UNVERIFIED);
                    if(verified){ 
                        message.member.roles.add(verified);
                        message.member.roles.remove(unverified);
                        message.author.send("You have been verified!");
                    }
                    if(!verified) console.log("No verified tag");
                }
            }
            catch(err){
                console.log(err);
            }
        }
        catch(err){
            console.log(err);
        }
    }
};