const { CommandoClient } = require('discord.js-commando');
const Discord = require("discord.js");
const path = require('path');
const fs = require("fs");
require('dotenv').config();
const config = require( path.resolve( __dirname, "config.json" ) );

const client = new CommandoClient({
	commandPrefix: config.prefix,
	owner: process.env.OWNERS.split(','),	//if you're helping in developing this add your ID
	disableMentions: 'everyone',
	ws: { intents: Discord.Intents.ALL }
});

module.exports = {
	client: client,
};

client.registry
	.registerDefaultTypes()
	.registerGroups([ //Classifies each command and sorts it
		['tools', 'All the tools for the server'],	//for all the tools
		['usersettings', 'All the setings for the user'], //for the user
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

//parsing events
fs.readdir('./events', (err, files) => {
	if (err) return console.log(err);
	let jsFiles = files.filter(file => file.split('.').pop() === 'js');
	jsFiles.forEach(file => {
		const prop = require(`./events/${file}`);
		client.on(prop.help.event, prop);
	});
});


client.on('error', console.error);

client.login(process.env.TOKEN);