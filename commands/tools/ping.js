const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping test!"),
  run: async (interaction) => {
    const embed = new MessageEmbed()
      .setTitle("Ping!")
      .setColor("#71B8FF")
      .setDescription(
        `Pong! Latency is ${Math.abs(Date.now() - interaction.createdTimestamp)}ms.`
      );
    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
