//const ora = require("ora");
const empty = require("is-empty");

const slash = {
  register: async (clientId, commands) => {
    console.log("Registering commands");

    const { REST } = require("@discordjs/rest");
    const { Routes } = require("discord-api-types/v9");

    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

    try {
      const guildId = "764415796897906709";
      if (!empty(guildId) ?? !isNaN(guildId)) {
        await rest
          .put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands,
          })
          .then(() => {
            return console.log("Successfully registered commands");
          });
      } else {
        await rest
          .put(Routes.applicationCommands(clientId), { body: commands })
          .then(() => {
            console.log("Successfully registered commands");
          });
      }
    } catch (error) {
      console.error(error);
    }
  },
};

module.exports = slash;
