const { SlashCommandBuilder } = require('discord.js');
const {cardType, cardEmoji} = require('../../config.json');


module.exports = {
    data : new SlashCommandBuilder()
        .setName('turn')
        .setDescription('takes your turn if it is your turn'),
    async execute(interaction) {
        let reply = "empty response";
        if (global.games.has(interaction.guild.id)) {
            if (global.gameInfo.get(interaction.guild.id).length == 0) {
                reply = {content: `Game has not started yet, do /start before taking your turn!`, ephemeral: true};
            } else{
                let players = global.games.get(interaction.guild.id);
                let turn = global.turns.get(interaction.guild.id);
                if (players[turn] == interaction.user) {
                    reply = "you are the turn player"
                } else {
                    reply = {content : `You are not the turn player! It's ${players[turn]} turn right now`, ephemeral : true};
                }
            }
        } else {
            reply = {content: `There is no game in this server yet, do /join to make and join one`, ephemeral: true};
        }
        await interaction.reply(reply);
    },
};