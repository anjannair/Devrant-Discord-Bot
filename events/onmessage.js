const config = require('../config.json');
const index = require('../index');
const bot = index.client;


module.exports = async message => {

	if (message.author.bot) return;					//ignores a bot
	if (message.channel.type === "dm") return;		//ignores DMs

	//checking for set prefix
	let prefix = config.prefix;
	let args = message.content.slice(prefix.length).trim().split(' ');
	let argument = args.shift().toLowerCase();
	let botrun;

	if (!message.content.startsWith(prefix)) return;		//if not start with prefix ignore

	//for commands
	if (bot.commands.has(argument)) {
		botrun = bot.commands.get(argument);
	}
	else {
		botrun = bot.commands.get(bot.aliases.get(argument));
	}
	if (botrun) botrun.run(bot, message, args);		//Uses Discord Collections aka JS Map
};
module.exports.help = {
	event: 'message'
};