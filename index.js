const { CommandoClient } = require('discord.js-commando');
const Discord = require("discord.js");
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();
const config = require( path.resolve( __dirname, "config.json" ) );

const client = new CommandoClient({
	commandPrefix: config.prefix,
	owner: process.env.OWNERS.split(','),	//if you're helping in developing this add your ID
	disableMentions: 'everyone',
	ws: { intents: Discord.Intents.ALL }
});

client.registry
	.registerDefaultTypes()
	.registerGroups([ //Classifies each command and sorts it
		['tools', 'All the tools for the server'],	//for all the tools
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
		ping: false,
		prefix: false,
		commandState: false,
		unknownCommand: false,
	})
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
	console.log(`Logged in as ${client.user.username}`);
	client.user.setActivity(config.activity.game, {type:'STREAMING'});
});

client.on('message', async message =>{
	function isValidURL(string) {
		//regex for link
		const res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
		return (res !== null);
	}
	if(isValidURL(message.content.toLowerCase())==true){
		let storyfetcher = `https://api.smmry.com/&SM_API_KEY=${process.env.TLDR}&SM_URL=${message.content.toLowerCase()}`
        let response = await fetch(storyfetcher).catch(err =>{
			console.log("error");
		});
		let data = await response.json();
		if(!data) return;
		if(data.sm_api_error) return;
		if(data.sm_api_character_count > 2048) return;
		
		const embed = new Discord.MessageEmbed()
			.setTitle(data.sm_api_title)
			.setColor('#FF7F50')
			.setDescription(data.sm_api_content)
			.setFooter(`I have reduced the article for you by ${data.sm_api_content_reduced}`)
		message.channel.send(embed);
	}
	else return;
})

client.on('error', console.error);

client.login(process.env.TOKEN);