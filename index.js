require("dotenv").config();
const config = require("./config");
const fs = require("fs");

// Slash Commands
const { Client, Collection, Intents } = require("discord.js");
const slash = require("./util/slash");

// CLI
console.log("Loading intents");

// Checks
let finalIntents = [
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.GUILD_MEMBERS,
];

const client = new Client({ intents: finalIntents });
module.exports = {
  client: client,
};

// Commands
client.commands = new Collection();

const events = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

events.forEach((event) => {
  const eventFile = require(`./events/${event}`);
  if (eventFile.oneTime) {
    client.once(eventFile.event, (...args) => eventFile.run(...args));
  } else {
    client.on(eventFile.event, (...args) => eventFile.run(...args));
  }
});

client.login(process.env.TOKEN);
console.log("Logged in!");
