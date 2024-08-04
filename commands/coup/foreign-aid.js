const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const {endTurn, performChallenge} = require('../../turn-utils.js');
const {cardType, cardEmoji, thinkingTime} = require('../../config.json');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('foreign-aid')
        .setDescription('perform the foreign aid action, if it is your turn'),
    async execute(interaction) {
        let reply = 'empty';
        let deployedButtons = false;
        if (global.games.has(interaction.guild.id) && (!global.gameInfo.get(interaction.guild.id).length == 0) ){
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            let hands = global.hands.get(interaction.guild.id);
            if (interaction.user == players[turn]&& global.lock.get(interaction.guild.id) ){
                global.lock.set(interaction.guild.id, false);
                const dukeBlock = new ButtonBuilder()
                .setCustomId('dukeBlock')
                .setLabel(`Block with Duke`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji(cardEmoji[3]);

                const noBlocksEnabled = new ButtonBuilder()
                .setCustomId('noBlocks')
                .setLabel('No Blocks / Challenges')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('✅')
                .setDisabled(false);

                deployedButtons = true;
                row = new ActionRowBuilder()
                    .addComponents(dukeBlock, noBlocksEnabled);

                reply = {content :`${players[turn]} is attempting to perform foreign aid, gaining 2 coins. Someone claiming duke can block this action!`, components : [row]};
            } else {
                reply = {content : `You are not the turn player! It's ${players[turn]} turn right now`, ephemeral : true};
            }
        } else {
            reply = {content : `There either isn't a game in this server, or it hasn't been /start 'ed yet`, ephemeral : true};
        }

        const response = await interaction.reply(reply);
        if (deployedButtons){
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            let hands = global.hands.get(interaction.guild.id);
            const collectorFilter = i => players.includes(i.user);

            try {
                const action = await response.awaitMessageComponent({ filter: collectorFilter,time: thinkingTime });
                if(action.customId == "noBlocks") {
                    hands.get(players[turn])[1] = hands.get(players[turn])[1] + 2;
                    await action.update({content: `Foreign Aid successfully performed! ${players[turn]} has gained 2 coins and now has ${hands.get(players[turn])[1]} coins.`, components : []});
                    endTurn(action, interaction.guild.id, players);
                } else if (action.customId == "dukeBlock") {
                    await action.update({components : []});

                    const challenge = new ButtonBuilder()
                    .setCustomId('challenge')
                    .setLabel('Challenge')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌');

                    const noBlocksEnabled = new ButtonBuilder()
                    .setCustomId('noBlocks')
                    .setLabel('No Blocks / Challenges')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('✅')
                    .setDisabled(false);

                    let row = new ActionRowBuilder()
                    .addComponents(challenge, noBlocksEnabled)
                    const challenging = await action.followUp({content : `${action.user} is claiming Duke ${cardEmoji[3]} and has blocked ${interaction.user}'s foreign aid action, anyone can challenge this!`, components : [row]})
                    try {
                        const choice = await challenging.awaitMessageComponent({ filter: collectorFilter, time: thinkingTime });
                        if (choice.customId == "noBlocks") {
                            await choice.reply(`Foreign Aid successfully blocked, no challenges`)
                            await endTurn(choice, interaction.guild.id, global.games.get(interaction.guild.id));
                        } else {
                            await choice.reply(`${choice.user} has challenged ${action.user}`);
                            if (await performChallenge(choice, choice.user, action.user, 3)) {
                                hands.get(players[turn])[1] = hands.get(players[turn])[1] + 2;
                                await choice.followUp({content: `Foreign Aid successfully performed! ${players[turn]} has gained 2 coins and now has ${hands.get(players[turn])[1]} coins.`, components : []});
                            } else {
                                await choice.followUp(`Foreign Aid successfully blocked, challenge failed.`)
                            }
                            await endTurn(choice, interaction.guild.id, global.games.get(interaction.guild.id));
                        }
                    } catch(e) {
                        await choice.reply(`Foreign Aid successfully blocked, no challenges before timeout`)
                        endTurn(choice, interaction.guild.id, global.games.get(interaction.guild.id));
                    }
                }
            } catch (e) {
                await interaction.followUp({ content : `No choice taken in 2 minutes, timing out. Do /foreign-aid again to take your turn.`});
            }
        }
    }       
};