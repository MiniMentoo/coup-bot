const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const {cardType, cardEmoji, thinkingTime} = require('../../config.json');
const { setTimeout } = require("timers/promises");


module.exports = {
    data : new SlashCommandBuilder()
        .setName('help')
        .setDescription('a guide on using this bot!'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
        .setTitle('Coup help')
        .setColor( 0xbebebb )
        .addFields(
            {name : `Make a game`, value: `/join will make a game in your server if there isn't one already, wait until everyone is in before doing /start`},
            {name : `Last one standing wins!`, value: `Everyone gets two cards to win, last one standing wins, there is no second place`},
            {name : `/turn`, value: `Shows you all possible actions you can take, careful! The ones with roles next to them is claiming you have a certain card, if you're caught lying you might be challenged!`},
            {name : `Challenge`, value: `Wait for people to say no response before clicking it, people can block by claiming a role or challenge you if they think you're lying`},
            {name : `Blocking`, value: `Unless you're blocking foreign aid, you can only block actions you're the target of, you can however, challenge whenever you want!`},
            {name : `Read the official rules here`, value: `https://www.qugs.org/rules/r131357.pdf`},
        )  
        await interaction.reply({embeds : [embed]});
    },
};