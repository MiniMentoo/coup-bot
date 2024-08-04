const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const {endTurn, performChallenge} = require('../../turn-utils.js');
const {cardType, cardEmoji, thinkingTime} = require('../../config.json');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('tax')
        .setDescription('perform the tax action, if it is your turn'),
    async execute(interaction) {
        let reply = 'empty';
        let deployedButtons = false;
        if (global.games.has(interaction.guild.id) && (!global.gameInfo.get(interaction.guild.id).length == 0)){
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            if (interaction.user == players[turn]&& global.lock.get(interaction.guild.id) ){
                global.lock.set(interaction.guild.id, false);
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
                deployedButtons = true;
                reply = {content : `${interaction.user} is claiming Duke ${cardEmoji[3]} and is attempting the Tax action, anyone can challenge this!`, components : [row]};
            } else {
                reply = {content : `You are not the turn player! It's ${players[turn]} turn right now`, ephemeral : true};
            }
        } else {
            reply = {content : `There either isn't a game in this server, or it hasn't been /start 'ed yet`, ephemeral : true};
        }

        const response = await interaction.reply(reply);
        if (deployedButtons) {
            let hands = global.hands.get(interaction.guild.id);
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            const collectorFilter = i => players.includes(i.user);
            try {
                const action = await response.awaitMessageComponent({ filter: collectorFilter,time: thinkingTime });
                await interaction.editReply({components: []});
                if(action.customId == "noBlocks") {
                    hands.get(players[turn])[1] = hands.get(players[turn])[1] + 3;
                    await action.update({content: `Tax successfully performed! ${players[turn]} has gained 3 coins and now has ${hands.get(players[turn])[1]} coins.`, components : []});
                    await endTurn(action, interaction.guild.id, players);
                } else if (action.customId == "challenge") {
                    await action.reply(`${action.user} has challenged ${interaction.user}`);
                    if (! await performChallenge(action, action.user, interaction.user, 3)) {
                        hands.get(players[turn])[1] = hands.get(players[turn])[1] + 3;
                        await action.followUp({content: `Tax successfully performed! ${players[turn]} has gained 3 coins and now has ${hands.get(players[turn])[1]} coins.`, components : []});
                    } else {
                        await action.followUp(`Tax action failed as the challenge succeeded, turn passed.`)
                    }
                    await endTurn(action, interaction.guild.id, players);
                }
            } catch (e) {
                hands.get(players[turn])[1] = hands.get(players[turn])[1] + 3;
                await interaction.update({content: `Thinking time timed out, Tax successfully performed! ${players[turn]} has gained 3 coins and now has ${hands.get(players[turn])[1]} coins.`, components : []});
                await endTurn(interaction, interaction.guild.id, players);
            } 
        }       
    }
};