const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data : new SlashCommandBuilder()
        .setName('ping')
        .setDescription('pings user')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('the target of the ping'))
        .addIntegerOption(option =>
            option
                .setName('quantity')
                .setDescription('number of pings')
                .setMaxValue(100)),
    async execute(interaction) {
        const user = interaction.options.getUser('target') ?? interaction.user;
        const quantity = interaction.options.getInteger('quantity') ?? 1;
        await interaction.reply(`${user}`);
        for (let i = 1; i < quantity; i++){
            await wait(4_000);
            await interaction.followUp(`${user}`);
        }
    },
};