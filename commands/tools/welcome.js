const { Command } = require('discord.js-commando');

module.exports = class welcome extends Command {
	constructor(client) {
		super(client, {
			name: 'welcome',
			group: 'tools',
			memberName: 'welcome',
			description: 'Welcomes the user for no reason',
		});
	}

	run(message) {
		return message.say(`Welcome to the ${message.guild.name} server

		Total number of members are: ${message.guild.memberCount}

		Server region: ${message.guild.region}`);
	}
};