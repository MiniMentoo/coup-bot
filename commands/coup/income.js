const { SlashCommandBuilder } = require('discord.js');
const {endTurn} = require('../../turn-utils.js');


module.exports = {
    data : new SlashCommandBuilder()
        .setName('income')
        .setDescription('perform the income action, if it is your turn'),
    async execute(interaction) {
        let reply = 'empty';
        let deployedAction = false;
        if (global.games.has(interaction.guild.id) && (!global.gameInfo.get(interaction.guild.id).length == 0)){
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            let hands = global.hands.get(interaction.guild.id);
            if (interaction.user == players[turn]) {
                hands.get(players[turn])[1] = hands.get(players[turn])[1] + 1;
                reply = {content: `${players[turn]} did income and gained one coin, they now have ${hands.get(players[turn])[1]} coins`};
                deployedAction = true;
            } else {
                reply = {content : `You are not the turn player! It's ${players[turn]} turn right now`, ephemeral : true};
            }
        } else {
            reply = {content : `There either isn't a game in this server, or it hasn't been /start 'ed yet`, ephemeral : true};
        }

        await interaction.reply(reply);
        if (deployedAction) {
            await endTurn(interaction, interaction.guild.id, global.games.get(interaction.guild.id));
        }
    }       
};