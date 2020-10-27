const { CommandoClient } = require('discord.js-commando');
const Discord = require("discord.js");
const path = require('path');
require('dotenv').config();
const config = require( path.resolve( __dirname, "config.json" ) );

const client = new CommandoClient({
	commandPrefix: config.prefix,
	owner: '414992506665828364',	//if you're helping in developing this add your username (create an array)
	disableMentions: 'everyone',
	ws: { intents: Discord.Intents.ALL }
});

client.registry
	.registerDefaultTypes()
	.registerGroups([
		['tools', 'All the tools for the server'], //Classifies each command and sorts it
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

client.on('guildCreate',()=>{
	let defaultChannel = "";
    guild.channels.cache.forEach((channel) => {
    if(channel.type == "text" && defaultChannel == "") {
    if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
      defaultChannel = channel;
    }
  }
});
//defaultChannel will be the channel object that the bot first finds permissions for
let embed = new discord.MessageEmbed()
    .setTitle("Thank You For Adding Me")
    .setDescription('My default prefix is *\n\nFor more commands use \`*help\`\n')
    .setTimestamp();
defaultChannel.send(embed);
})

client.on('error', console.error);

client.login(process.env.TOKEN);