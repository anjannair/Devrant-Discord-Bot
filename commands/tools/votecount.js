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
        let reactionsCount = 0;
        
        await message.reply(`Searching for entries in ${channel}...`);
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
                    
                    reactionsCount += liked.length + disliked.length;
                });
                promises.push(promise);
            }
        }

        await Promise.all(promises);
        if (!entries.length) {
            return message.reply(`There are no recent votes in ${channel}. Make sure messages have 👍 or 👎.`);
        }
        
        entries.sort((entryA, entryB) => entryA.message.createdTimestamp - entryB.message.createdTimestamp);
        await message.channel.send(`Here's  what we found...`);
        
        // Perform partitioning in accordance with http://www8.cs.umu.se/kurser/TDBAfl/VT06/algorithms/BOOK/BOOK2/NODE45.HTM
        const pointRanges = partition(Array.from(pointSet).sort((a, b) => b - a), 8);
        for (const range of pointRanges) {
            if (!range.length) break;

            const rangeMin = Math.min(range);
            const rangeMax = Math.max(range);
            const rangeLabelPrefix = rangeMin > 0 ? "✅" : "✖";
            const rangeLabel = range.length === 1 ? range[0].toString() : `${rangeMin}–${rangeMax}`;
            const rangeList = [];

            let embed, fields;
            for (const { message: entryMessage, points: { likes, dislikes, total } } of entries) {
                if (total < rangeMin || total > rangeMax) continue;
                
                let embedContinued;
                if (embed?.fields?.length >= 25) {
                  await message.channel.send(embed);
                  embed = null;
                  embedContinued = true;
                }
                if (!embed) {
                  embed = {
                    title: `${rangeLabelPrefix} ${rangeLabel} pts ${embedContinued ? '*(continued)*' : ''}`,
                    fields: []
                  };
                }
                
                const title = entryMessage.cleanContent.split("\n", 1)[0].trim() || entryMessage.embeds[0]?.title || 'Untitled';
                embed.fields.push({
                  name: `${total} (${likes}👍/👎${dislikes})`,
                  value: `__**${title}**__`
                });
            }

            if (embed.fields.length) {
              await message.channel.send(embed);
            }
        }

        return message.channel.send(`Counted ${reactionsCount} reactions on ${entries.length} entries.`);
    }
};