const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const {endTurn, loseInfluence, performChallenge} = require('../../turn-utils.js');
const {cardType, cardEmoji, thinkingTime} = require('../../config.json');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('steal')
        .setDescription('perform the steal action, if it is your turn')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('the target of the steal')
                .setRequired(true)),
    async execute(interaction) {
        let reply = 'empty';
        let deployedButtons = false;
        const target = interaction.options.getUser('target');
        if (global.games.has(interaction.guild.id) && (!global.gameInfo.get(interaction.guild.id).length == 0)){
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            let hands = global.hands.get(interaction.guild.id);
            if (interaction.user == players[turn]&& global.lock.get(interaction.guild.id) ){
                if (players.includes(target) && hands.get(target)[3]) {
                    if (hands.get(target)[1] >= 2) {
                        deployedButtons = true;
                        global.lock.set(interaction.guild.id, false);

                        const captainBlock = new ButtonBuilder()
                            .setCustomId('captainBlock')
                            .setLabel(`Block with Captain`)
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji(cardEmoji[0]);
            
                        const ambassadorBlock = new ButtonBuilder()
                            .setCustomId('ambassadorBlock')
                            .setLabel(`Block with Ambassador`)
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji(cardEmoji[2]);

                        const noBlocks = new ButtonBuilder()
                            .setCustomId('noBlocks')
                            .setLabel('No Blocks / Challenges')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('✅');
                    
                        const challenge = new ButtonBuilder()
                            .setCustomId('challenge')
                            .setLabel('Challenge')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('❌');
                        
                        const row = new ActionRowBuilder()
                            .addComponents(challenge, captainBlock, ambassadorBlock, noBlocks);
                        
                        reply = {content: `${interaction.user} is claiming Captain ${cardEmoji[0]} and is attempting to steal 2 coins from ${target}
They will have ${hands.get(interaction.user)[1] + 2} coins if this goes through. This action can be challenged by anyone or blocked with Captain / Ambassador.`, components : [row]};
                    } else {
                        reply = {content: `${target} doesn't have enough money to be stolen from, try someone else!`, ephemeral : true};
                    }
                } else {
                    reply = {content : `The target isn't part of this game, try again with someone else.`, ephemeral : true};
                }
            } else {
                reply = {content : `You are not the turn player! It's ${players[turn]} turn right now`, ephemeral : true};
            }
        } else {
            reply = {content : `There either isn't a game in this server, or it hasn't been /start 'ed yet`, ephemeral : true};
        }

        const response = await interaction.reply(reply);
        if (deployedButtons){
            let hands = global.hands.get(interaction.guild.id);
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            const collectorFilter = i => players.includes(i.user);

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
                .addComponents(challenge, noBlocksEnabled);

            try {
                const action = await response.awaitMessageComponent({filter : collectorFilter, time: thinkingTime});
                await interaction.editReply({components : []});
                if (action.customId == "noBlocks") {
                    hands.get(players[turn])[1] = hands.get(players[turn])[1] + 2;
                    hands.get(target)[1] = hands.get(target)[1] - 2;
                    await action.update({content: `Steal successfully performed! ${players[turn]} has gained 2 coins and now has ${hands.get(players[turn])[1]} coins.
${target} has lost 2 coins and now has ${hands.get(target)[1]} coins`, components : []});
                } else if (action.customId == "challenge") {
                    await action.reply(`${action.user} has challenged ${interaction.user}`);
                    if(! await performChallenge(action, action.user, interaction.user, 0)) {
                        hands.get(players[turn])[1] = hands.get(players[turn])[1] + 2;
                        hands.get(target)[1] = hands.get(target)[1] - 2;
                        await action.followUp({content: `Steal successfully performed! ${players[turn]} has gained 2 coins and now has ${hands.get(players[turn])[1]} coins.
${target} has lost 2 coins and now has ${hands.get(target)[1]} coins`, components : []});
                    } else {
                        await action.followUp(`Steal failed as challenge succeeded.`);
                    }
                } else if (action.customId == "captainBlock") {
                    await action.update({components : []});

                    const challenging = await action.followUp({content : `${action.user} is claiming Captain ${cardEmoji[0]} and has blocked ${interaction.user}'s steal, anyone can challenge this!`, components : [row]})
                    try {
                        const choice = await challenging.awaitMessageComponent({ filter: collectorFilter, time: thinkingTime });
                        if (choice.customId == "noBlocks") {
                            await choice.reply(`Steal successfully blocked, no challenges`)
                        } else {
                            await choice.reply(`${choice.user} has challenged ${action.user}`);
                            if (await performChallenge(choice, choice.user, action.user, 0)) {
                                hands.get(players[turn])[1] = hands.get(players[turn])[1] + 2;
                                hands.get(target)[1] = hands.get(target)[1] - 2;
                                await choice.followUp({content: `Challenge suceeded, Captain block fails, steal goes through! ${players[turn]} has gained 2 coins and now has ${hands.get(players[turn])[1]} coins.
${target} has lost 2 coins and now has ${hands.get(target)[1]} coins`, components : []});
                            } else {
                                await choice.followUp(`Challenge failed, Captain block remains. Turn passes.`)
                            }
                        }
                    } catch(e) {
                        await choice.reply(`Steal successfully blocked, no challenges before timeout`)
                    }
                } else if (action.customId == "ambassadorBlock") {
                    await action.update({components : []});

                    const challenging = await action.followUp({content : `${action.user} is claiming Ambassador ${cardEmoji[2]} and has blocked ${interaction.user}'s steal, anyone can challenge this!`, components : [row]})
                    try {
                        const choice = await challenging.awaitMessageComponent({ filter: collectorFilter, time: thinkingTime });
                        if (choice.customId == "noBlocks") {
                            await choice.reply(`Steal successfully blocked, no challenges`)
                        } else {
                            await choice.reply(`${choice.user} has challenged ${action.user}`);
                            if (await performChallenge(choice, choice.user, action.user, 2)) {
                                hands.get(players[turn])[1] = hands.get(players[turn])[1] + 2;
                                hands.get(target)[1] = hands.get(target)[1] - 2;
                                await choice.followUp({content: `Challenge suceeded, Ambassador block fails, steal goes through! ${players[turn]} has gained 2 coins and now has ${hands.get(players[turn])[1]} coins.
${target} has lost 2 coins and now has ${hands.get(target)[1]} coins`, components : []});
                            } else {
                                await choice.followUp(`Challenge failed, Ambassador block remains. Turn passes.`)
                            }
                        }
                    } catch(e) {
                        await choice.reply(`Steal successfully blocked, no challenges before timeout`)
                    }
                }
                await endTurn(action, interaction.guild.id, global.games.get(interaction.guild.id));
            } catch(e) {
                hands.get(players[turn])[1] = hands.get(players[turn])[1] + 2;
                hands.get(target)[1] = hands.get(target)[1] - 2;
                await action.update({content: `Buttons timed out, steal going through, ${players[turn]} has gained 2 coins and now has ${hands.get(players[turn])[1]} coins.
${target} has lost 2 coins and now has ${hands.get(target)[1]} coins`, components : []});
                    await endTurn(action, interaction.guild.id, players);
            }
        }
    }       
};