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

                reply = {content : `${interaction.user} is claiming Ambassador ${cardEmoji[2]} is attempting the exchange action
They will draw 2 cards from the deck and pick which roles to keep (they cannot replace revealed cards). This action can only be challenged!`, components : [row]};
            } else {
                reply = {content : `You are not the turn player! It's ${players[turn]} turn right now`, ephemeral : true};
            }
        } else {
            reply = {content : `There either isn't a game in this server, or it hasn't been /start 'ed yet`, ephemeral : true};
        }

        await interaction.reply(reply);
    }       
};