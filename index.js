const { CommandoClient } = require('discord.js-commando');
const Discord = require("discord.js");
const path = require('path');
const fs = require("fs");
require('dotenv').config();
const Heroku = require('heroku-client');
const heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });
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

client.once('ready', async () => {
	console.log(`Logged in as ${client.user.username}`);
	client.user.setActivity(config.activity.game, {type:'STREAMING'});
	//Message to inform user about bot activate
	const user = client.users.cache.get(process.env.OWNERS.split(',')[0]);
	await heroku.get('/apps').then(apps => {
		const embed = new Discord.MessageEmbed()
			.setColor("#E7A700")
			.setDescription("**" + apps[0].name + "** is up and running!")
			.addField("Date", apps[0].updated_at.split('T')[0])
			.addField("UTC Time (+5:30 IST)", apps[0].updated_at.split('T')[1].split('Z')[0]);
		user.send(embed);
	});
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