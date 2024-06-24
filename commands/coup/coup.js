const { SlashCommandBuilder } = require('discord.js');
const {endTurn, loseInfluence} = require('../../turn-utils.js');
const {cardType, cardEmoji, thinkingTime} = require('../../config.json');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('coup')
        .setDescription('perform the coup action, if it is your turn')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('the target of the coup')
                .setRequired(true)),
    async execute(interaction) {
        let reply = 'empty';
        let deployedAction = false;
        const target = interaction.options.getUser('target');
        if (global.games.has(interaction.guild.id) && (!global.gameInfo.get(interaction.guild.id).length == 0)){
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            let hands = global.hands.get(interaction.guild.id);
            if (interaction.user == players[turn]) {
                if (players.includes(target) && hands.get(target)[3]) {
                    if (hands.get(interaction.user)[1] >= 7) {
                        deployedAction = true;
                        hands.get(players[turn])[1] = hands.get(players[turn])[1] - 7;
                        reply = {content: `${interaction.user} has spent 7 coins and performed a coup on ${target}
They now have ${hands.get(interaction.user)[1]} coins.`}
                    } else {
                        reply = {content : `A Coup requires 7 coins, and you only have ${hands.get(interaction.user)[1]}`, ephemeral : true};
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

        await interaction.reply(reply);
        if (deployedAction){
            await loseInfluence(interaction, target);
            await endTurn(interaction, interaction.guild.id, global.games.get(interaction.guild.id));
        }
    }       
};