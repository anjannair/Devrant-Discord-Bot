const { CommandoClient } = require('discord.js-commando');
const Discord = require("discord.js");
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

client.on('error', console.error);

client.login(process.env.TOKEN2);