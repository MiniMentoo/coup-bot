const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const {cardType, cardEmoji, thinkingTime} = require('../../config.json');
const { setTimeout } = require("timers/promises");


module.exports = {
    data : new SlashCommandBuilder()
        .setName('turn')
        .setDescription('displays the possible actions if its your turn'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
        .setTitle('Turn actions')
        .setColor( 0xbebebb )
        .addFields(
            {name : `💰 Income`, value: `gain 1 coin (cannot be blocked)`},
            {name : `🇺🇳 Foreign Aid`, value: `gain 2 coins (blocked by ${cardEmoji[3]})`},
            {name : `✊ Coup`, value: `Pay 7 coins to force 1 player to lose influence (cannot be blocked)`},
            {name : `${cardEmoji[3]} Tax`, value: `Claim duke and gain 3 coins (cannot be blocked)`},
            {name : `${cardEmoji[1]} Assassinate`, value: `Claim assassin and pay 3 coins to force 1 player to lose influence (blocked by ${cardEmoji[4]})`},
            {name : `${cardEmoji[0]} Steal`, value: `Claim captain to steal 2 coins from another player (blocked by ${cardEmoji[0]} & ${cardEmoji[2]})`},
            {name : `${cardEmoji[2]} Exchange`, value: `Claim ambassador to draw 2 cards from court deck and swap as many of those as you want with the cards you have facedown (cannot be blocked)`},
        )  
        await interaction.reply({embeds : [embed]});
    },
};