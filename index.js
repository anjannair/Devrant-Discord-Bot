const { CommandoClient } = require('discord.js-commando');
const path = require('path');
require('dotenv').config();
const config = require( path.resolve( __dirname, "config.json" ) );

const client = new CommandoClient({
	commandPrefix: config.prefix,
	owner: '414992506665828364'	//if you're helping in developing this add your username (create an array)
});

client.registry
	.registerDefaultTypes()
	.registerGroups([
		['tools', 'All the tools for the server'], //Classifies each command and sorts it
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
	console.log(`Logged in as ${client.user.username}`);
	client.user.setActivity(config.activity.game, {type:'STREAMING'});
});

client.on('error', console.error);

client.login(process.env.TOKEN);