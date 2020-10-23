const fs = require("fs");
const Discord = require('discord.js');
const bot = new Discord.Client({ ws: { intents: Discord.Intents.ALL } }); 
bot.aliases = new Discord.Collection();
bot.dsd = new Discord.Collection();
bot.admin = new Discord.Collection();
bot.newbie = new Discord.Collection();
bot.misc = new Discord.Collection();