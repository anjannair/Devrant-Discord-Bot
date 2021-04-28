const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');
const partition = require('linear-partitioning');

module.exports = class votecount extends Command {
    constructor(client) {
        super(client, {
            name: 'votecount',
            group: 'tools',
            aliases: ['countvotes'],
            memberName: 'votecount',
            description: 'Count thumb votes on consequent messages in the specified channel',
            guildOnly: true,
            args: [
                {
                    key: "channel",
                    prompt: "In which channel should I count the votes?",
                    type: "channel",
                    default: ({ channel }) => channel
                }
            ]
        });
    }

    async run(message, { channel }) {
        const entries = [];
        const pointSet = new Set();

        // This may take some loading time, so we inform user via reaction
        const loadingReaction = await message.react("💬");
        const promises = [];

        const channelMessages = await channel.messages.fetch({ limit: 100 });
        for (const [_, entryMessage] of channelMessages) {
            const likeReaction = entryMessage.reactions.cache.get("👍");
            const dislikeReaction = entryMessage.reactions.cache.get("👎");
            if (likeReaction || dislikeReaction) {
                const promise = Promise.all([
                    likeReaction?.users.fetch(),
                    dislikeReaction?.users.fetch()
                ]).then(([likeReactionUsers, dislikeReactionUsers]) => {
                    const liked = (Array.from(likeReactionUsers?.keys() ?? []))
                        .filter(id => !dislikeReactionUsers?.get(id));
                    const disliked = (Array.from(dislikeReactionUsers?.keys() ?? []))
                        .filter(id => !likeReactionUsers?.get(id));

                    // Always count human author as if they liked their own message (if they did not vote on it already)
                    if (!entryMessage.author.bot) {
                        const authorId = entryMessage.author.id;
                        const dislikedIndex = disliked.indexOf(authorId);
                        if (!liked.includes(authorId) && dislikedIndex === -1) {
                            liked.push(authorId);
                        } else if (dislikedIndex > -1) {
                            disliked.splice(dislikedIndex, 1);
                        }
                    }
                    
                    const total = liked.length - disliked.length;
                    entries.push({
                        message: entryMessage,
                        points: {
                            likes: liked.length,
                            dislikes: disliked.length,
                            total
                        }
                    });
                    pointSet.add(total);
                });
                promises.push(promise);
            }
        }

        await Promise.all(promises);
        loadingReaction.users.remove(this.client.id);

        if (!entries.length) {
            return message.reply(`There are no recent votes in ${channel}. Make sure messages have 👍 or 👎.`);
        }
        
        entries.sort((entryA, entryB) => entryA.message.createdTimestamp - entryB.message.createdTimestamp);

        const embed = new MessageEmbed()
            .setTitle(`Counted votes`)
            .setDescription(`on ${entries.length} entries in ${channel}.`)
            .setFooter(`Requested: ${message.member.name || message.author.username}`)
            .setTimestamp();
        
        // Perform partitioning in accordance with http://www8.cs.umu.se/kurser/TDBAfl/VT06/algorithms/BOOK/BOOK2/NODE45.HTM
        const pointRanges = partition(Array.from(pointSet).sort((a, b) => b - a), 25);
        for (const range of pointRanges) {
            if (!range.length) break;

            const rangeMin = Math.min(range);
            const rangeMax = Math.max(range);
            const rangeLabelPrefix = rangeMin > 0 ? "✅" : "✖";
            const rangeLabel = range.length === 1 ? range[0] : `${rangeMin}–${rangeMax}`;
            const rangeList = [];

            for (const { message, points: { likes, dislikes, total } } of entries) {
                if (total < rangeMin || total > rangeMax) continue;
                let title = message.cleanContent.split("\n", 1)[0].trim() || message.embeds[0]?.title || "...";
                rangeList.push(`\`${total.toString().padStart(2)} pts (${likes.toString().padEnd(2)}👍/👎${dislikes.toString().padStart(2)}) \`🔎 __**${title}**__ ↙ ${message.url}`);
            }

            embed.addField(`${rangeLabelPrefix} ${rangeLabel}`, rangeList.join("\n"));
        }

        return message.channel.send(embed);
    }
};