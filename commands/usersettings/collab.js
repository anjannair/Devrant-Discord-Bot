const fetch = require("node-fetch");
const Discord = require("discord.js");
const apiurl = require("../../util/rantapi.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("collab") // /command-name
    .setDescription("Fetches known collaborations on devRant"),
  run: async (interaction) => {
    var tags = " ";
    let collabfetcher = `${apiurl.url}/devrant/collabs?app=3`;
    let response = await fetch(collabfetcher);
    let data = await response.json();
    let collabnumber =
      data.rants[Math.floor(Math.random() * data.rants.length)];
    if (collabnumber.tags) {
      tags = collabnumber.tags.join(",");
    }
    const embed = await new Discord.MessageEmbed()
      .setColor("#FF7F50")
      .setTitle(`Collaboration by ${collabnumber.user_username}`)
      .setDescription(collabnumber.text)
      .addField("Upvotes: ", `${collabnumber.score}`)
      .addField("Link to collab: ", `${apiurl.main}/${collabnumber.link}`)
      .setThumbnail(`${apiurl.avatar}/${collabnumber.user_avatar.i}`)
      .setImage(collabnumber.attached_image.url)
      .setFooter(tags);
    interaction.reply({ embeds: [embed] });
  },
};
