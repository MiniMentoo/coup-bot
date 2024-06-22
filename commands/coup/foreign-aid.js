const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const {endTurn} = require('../../turn-utils.js');
const {cardType, cardEmoji, thinkingTime} = require('../../config.json');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('foreign-aid')
        .setDescription('perform the foreign aid action, if it is your turn'),
    async execute(interaction) {
        let reply = 'empty';
        let deployedButtons = false;
        if (global.games.has(interaction.guild.id) && (!global.gameInfo.get(interaction.guild.id).length == 0)){
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            let hands = global.hands.get(interaction.guild.id);
            if (interaction.user == players[turn]) {
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
                const action = await response.awaitMessageComponent({ filter: collectorFilter,time: 180000 });
                if(action.customId == "noBlocks") {
                    hands.get(players[turn])[1] = hands.get(players[turn])[1] + 2;
                    await action.update({content: `Foreign Aid successfully performed! ${players[turn]} has gained 2 coins and now has ${hands.get(players[turn])[1]} coins.`, components : []});
                    endTurn(action, interaction.guild.id, players);
                } else if (action.customId == "dukeBlock") {
                    await action.update({components : []});
                    await action.followUp({content : `${action.user} has blocked ${interaction.user}'s foreign aid action, anyone can challenge this!`})
                }
            } catch (e) {
                console.log(e);
                await interaction.followUp({ content : `No choice taken in 2 minutes, timing out. Do /foreign-aid again to take your turn.`});
            }
        }
    }       
};