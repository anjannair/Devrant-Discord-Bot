const fetch = require("node-fetch");
const Discord = require("discord.js");
const apiurl = require("../../util/rantapi.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rant") // /command-name
    .setDescription("Fetches a random rant aka surprise rant from devRant"),
  run: async (interaction) => {
    var tags = " ";
    let rantfetcher = `${apiurl.url}/devrant/rants/surprise?app=3`;
    let response = await fetch(rantfetcher);
    let data = await response.json();
    if (data.rant.tags) {
      tags = data.rant.tags.join(",");
    }

    const embed = new Discord.MessageEmbed()
      .setColor("#FF7F50")
      .setTitle(`Rant by ${data.rant.user_username}`)
      .setDescription(data.rant.text)
      .addField("Upvotes: ", `${data.rant.score}`)
      .setThumbnail(`${apiurl.avatar}/${data.rant.user_avatar.i}`)
      .setImage(data.rant.attached_image.url)
      .setFooter(tags);
    interaction.reply({ embeds: [embed] });
  },
};
