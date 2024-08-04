const { SlashCommandBuilder } = require('discord.js');
const {endTurn} = require('../../turn-utils.js');


module.exports = {
    data : new SlashCommandBuilder()
        .setName('surrender')
        .setDescription('admit defeat and leave the game'),
    async execute(interaction) {
        let reply = 'empty';
        if (global.games.has(interaction.guild.id) && (!global.gameInfo.get(interaction.guild.id).length == 0)){
            let players = global.games.get(interaction.guild.id);
            let hands = global.hands.get(interaction.guild.id);
            if(players.indexOf(interaction.user) === -1) {
                reply = {content: `You're not in this game!`, ephemeral : true};
            } else {
                reply = {content : `${interaction.user} has surrendered! They're now out of this game`, ephemeral : true};
                let hand = hands.get(interaction.user);
                if (hand[0][0] != -1) {
                    hand[2][0]= hand[0][0];
                    hand[0][0] = -1;
                }
                if (hand[0][1] != -1) {
                    hand[2][1] = hand[0][1];
                    hand[0][1] = -1;
                }
                hand[3] = false;
            }
        } else {
            reply = {content : `There either isn't a game in this server, or it hasn't been /start 'ed yet`, ephemeral : true};
        }

        await interaction.reply(reply);
        let players = global.games.get(interaction.guild.id);
        let turn = global.turns.get(interaction.guild.id);
        if (players[turn] == interaction.user) {
            await endTurn(interaction, interaction.guild.id, global.games.get(interaction.guild.id));
        }
    }       
};