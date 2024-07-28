const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const {endTurn, loseInfluence, performChallenge, shuffle} = require('../../turn-utils.js');
const {cardType, cardEmoji, thinkingTime} = require('../../config.json');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('exchange')
        .setDescription('perform the exchange action, if it is your turn'),
    async execute(interaction) {
        let reply = 'empty';
        let deployedButtons = false;
        if (global.games.has(interaction.guild.id) && (!global.gameInfo.get(interaction.guild.id).length == 0)){
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            let hands = global.hands.get(interaction.guild.id);
            if (interaction.user == players[turn]) {
                deployedButtons = true;
                
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

                const row = new ActionRowBuilder()
                .addComponents(challenge, noBlocksEnabled);

                reply = {content : `${interaction.user} is claiming Ambassador ${cardEmoji[2]} and attempting the exchange action
They will draw 2 cards from the deck and pick which roles to keep (they cannot replace revealed cards). This action can only be challenged!`, components : [row]};
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
            const deck = global.gameInfo.get(interaction.guild.id);
            const hand = hands.get(interaction.user);

            try {
                const action = await response.awaitMessageComponent({filter : collectorFilter, time: thinkingTime});
                await interaction.editReply({components : []});
                if (action.customId == "noBlocks") {
                    let card1 = deck.splice(0,1);
                    let card2 = deck.splice(0,1);
                    if (hand[0][0] == -1) {

                    } else if (hand[0][1] == -1) {

                    } else {

                    }
                }
            
            } catch(e) {
                console.log(e);
                await action.update({content: `Buttons timed out, exchange going through`, components : []});
                await endTurn(action, interaction.guild.id, players);
            }
        }
    }       
};


async function returnTwo(card1, card2, card3, interaction) {
    
    const return1 = new ButtonBuilder()
                .setCustomId('return1')
                .setLabel(`${cardType[card1]}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(`${cardEmoji[card1]}`);

    const return2 = new ButtonBuilder()
                .setCustomId('return2')
                .setLabel(`${cardType[card2]}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(`${cardEmoji[card2]}`);
    
    const return3 = new ButtonBuilder()
                .setCustomId('return3')
                .setLabel(`${cardType[card3]}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(`${cardEmoji[card3]}`);

    const row = new ActionRowBuilder()
        .addComponents(return1, return2, return3);

    const response = await interaction.followUp({content : `${interaction.user}, pick TWO of the following cards to return to the deck, the last one will be the card in your hand`, 
        components : [row], ephemeral : true});
}