const { SlashCommandBuilder } = require('discord.js');
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
            if (interaction.user == players[turn]) {
                if (players.includes(target) && hands.get(target)[3]) {
                    if (hands.get(target)[1] < 2) {
                        //stuff
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

        await interaction.reply(reply);
    }       
};