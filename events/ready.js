// Util
const fs = require("fs");

// Slash Commands
const slash = require("../util/slash");

// CLI
console.log("Starting Discord.js Client");

module.exports = {
  event: "ready", // Name of the event
  oneTime: true, // If set to true the event will only be fired once until the client is restarted
  run: async (client) => {

    // Code variables has to re-written again because this was made in haste
    const commandFolder = fs
      .readdirSync("./commands")
      .filter((folder) => !folder.includes("."));

    let commandsArray = [];
    let commandFiles = [];
    let command = [];
    commandFolder.forEach((folder) => {
      commandFiles.push({"folder": folder, "files": fs.readdirSync(`./commands/${folder}`)});
    });

    commandFiles.forEach((files) => {
      files.files.forEach((file) => {
        command.push(require(`../commands/${files.folder}/${file}`));
      });
    });

    command.forEach((commands) => {
        client.commands.set(commands.data.name, commands);
        commandsArray.push(commands);
    });

    const finalArray = commandsArray.map((e) => e.data.toJSON());
    slash.register(client.user.id, finalArray);
  },
};
