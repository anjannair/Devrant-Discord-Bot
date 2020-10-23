const fs = require("fs");
const config = require('./config.json');
const Discord = require('discord.js');
require('dotenv').config();
const bot = new Discord.Client({ ws: { intents: Discord.Intents.ALL } }); 
bot.aliases = new Discord.Collection();
bot.commands = new Discord.Collection();
//exports
// add stuff you need from the main file into this object
// then use 
/*
 const index = require('./index');
 const something = index.something;
*/
module.exports = {
	client: bot,
};

// add events by using this format
/* 
	module.exports = parameter => {
		code
	}
	module.exports.help = {
		event: 'EVENTNAME
	}
*/

fs.readdir('./events', (err, files) => {
	if (err) return console.log(err);
	let jsFiles = files.filter(file => file.split('.').pop() === 'js');
	jsFiles.forEach(file => {
		const prop = require(`./events/${file}`);
		bot.on(prop.help.event, prop);
	});
});


//commands
//to add commands just add the file in this format

/*
const discord = require("discord.js");
//any other packages

module.exports.run = async (bot, message, args) => {
	//code
};

module.exports.help = {
	name: "",
    aliases: ['']
};
*/

fs.readdir("./commands/", (err, files) => {
	if (err) console.error(err);
	let jsfiles = files.filter(f => f.split(".").pop() === "js");

	if(jsfiles.length <= 0){
		console.log("There are no commands to load...");
		return;
	}

	console.log(`loading ${jsfiles.length} commands...`);
	jsfiles.forEach((f, i) => {
		let props = require(`./commands/${f}`);
        console.log(`${i+1}: ${f} loaded`);
        bot.commands.set(props.help.name, props);
	    props.help.aliases.forEach(alias => {
	        bot.aliases.set(alias, props.help.name);
        });
    });	
});

bot.login(process.env.TOKEN);