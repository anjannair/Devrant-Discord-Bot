const fetch = require("node-fetch");
const Discord = require("discord.js");
const apiurl = require("../../util/rantapi.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
require("dotenv").config();

module.exports = {
  fetchDRUserID: async (username) => {
    const response = await fetch(
      `${apiurl.url}/get-user-id?app=3&username=${username}`
    );
    return response.json();
  },
  fetchDRUser: async (id) => {
    const response = await fetch(`${apiurl.url}/users/${id}?app=3`);
    return response.json();
  },
  data: new SlashCommandBuilder()
    .setName("verify") // /command-name
    .setDescription("Verify yourself on devRant and get the verified role")
    .addStringOption((option) =>
      option
        .setName("devrant-username")
        .setDescription("Your devRant username")
        .setRequired(true)
    ),
  run: async (interaction) => {
    let memberVerifiedRole = interaction.member.roles.cache.get(
      process.env.VERIFIED
    );
    if (memberVerifiedRole) {
      return interaction.reply({
        embeds: [
          {
            title: `No need for this! 🙌`,
            description: `You have ${memberVerifiedRole} already.`,
          },
        ],
        ephemeral: true,
      });
    }

    // this checks for the users existence on devRant
    let username = await interaction.options.getString("devrant-username");
    let { user_id } = await module.exports.fetchDRUserID(username);
    if (!user_id) {
      interaction.reply({
        content: `There is no user by name \`${username}\` on devRant.`,
        ephemeral: true,
      });
      return;
    }

    const code = Math.random().toString(36).slice(2, 8);
    const token = `-connect+discord+${code}-`;

    const tickEmoji = "✅";
    const tickbutton = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setCustomId("tick")
        .setLabel(tickEmoji)
        .setStyle("PRIMARY")
    );

    // try catch because I was getting issues with permissions
    let reactMessage;
    try {
      reactMessage = await interaction.reply({
        content: `You are known as **${username}** on devRant! Awesome!<:smugblob:764807051154161666>\nTo verify connection, send following *token* as part of a last comment anywhere on devRant: \`\`\`${token}\`\`\``,
        embeds: [
          {
            title:
              "Link to our collab verification page if you need somewhere to paste the token to!",
            url: `https://devrant.com/collabs/${process.env.MAINRANT}`,
            color: "#FF7F50",
          },
        ],
        components: [tickbutton],
        ephemeral: true,
      });
    } catch (err) {
      reactMessage = interaction.reply({
        content:
          "I am missing permissions! Please ensure my role is higher than yours!",
        ephemeral: true,
      });
    }

    const filter = (i) =>
      i.customId === "tick" && i.user.id === interaction.user.id;
    const channelId = interaction.channelId;
    const channel = await interaction.client.channels.fetch(channelId);
    const collector = channel.createMessageComponentCollector({
      filter,
      time: 120000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "tick") {
        const userData = await module.exports.fetchDRUser(user_id);
        const body = userData.profile.content.content.comments[0].body;
        if (body && body.indexOf(token) > -1) {
          const unverifiedRole = await interaction.guild.roles.fetch(
            process.env.UNVERIFIED
          );
          const verifiedRole = await interaction.guild.roles.fetch(
            process.env.VERIFIED
          );
          if (unverifiedRole)
            await interaction.member.roles.remove(unverifiedRole);
          if (verifiedRole) {
            await interaction.member.roles.add(verifiedRole);
          }
          try {
            await interaction.member.setNickname(username);
          } catch (err) {
            console.log(err);
          }
          await i.update({
            content: "You are verified!",
            embeds: [
              {
                title: "You are awesome!😉",
                color: "#FF7F50",
              },
            ],
            components: [],
            ephemeral: true,
          });
        } else {
          await i.update({
            content: "Token was not found in the last comment. Try again.",
            components: [],
            ephemeral: true,
          });
        }
      }
    });
  },
};
