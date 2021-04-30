const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');

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
        
        entries.sort((entryA, entryB) => entryB.points.total - entryA.points.total || entryA.message.createdTimestamp - entryB.message.createdTimestamp);
        await message.channel.send(`Here is what we found...`);
        
        let embed;
        for (const { message: entryMessage, points: { likes, dislikes, total } } of entries) {
          if (embed?.fields.length >= 25) {
            await message.channel.send(embed);
            embed = null;
          }
          embed = embed ?? new MessageEmbed();
          
          const title = entryMessage.cleanContent.split("\n", 1)[0].trim() || entryMessage.embeds[0]?.title || 'Untitled';
          embed.addField(
            `${total > 0 ? '👌' : '✖️'} \`${total} pts\` (${likes}👍/👎${dislikes})`,
            `__**${title}**__`
          );
        }
        if (embed.fields.length) {
          await message.channel.send(embed);
        }
        
        return message.channel.send(`Counted ${reactionsCount} reactions on __${entries.length} entries__.`);
    }
};