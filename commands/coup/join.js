const { SlashCommandBuilder, parseResponse, codeBlock } = require('discord.js');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('join')
        .setDescription("Joins this servers game (or starts one if there isn't one)"),
    async execute(interaction) {
        let reply = ``;
        if (global.games.has(interaction.guild.id)) {
            if (global.gameInfo.get(interaction.guild.id).length){
                reply = {content : `Sorry, the game has already started!`, ephemeral : true};
            } else{
                let gameUsers = global.games.get(interaction.guild.id);
                if(gameUsers.indexOf(interaction.user) === -1) {
                    gameUsers.push(interaction.user);
                    userNames = [];
                    let gameHands = global.hands.get(interaction.guild.id);
                    gameHands.set(interaction.user, []);
                    gameUsers.forEach((user) => userNames.push(`${user.displayName} `));
                    reply = codeBlock('md',`${interaction.user.displayName} has joined the game!
current members:
# ${userNames}`); 
                } else {
                    reply = {content : `You're already in this game!`, ephemeral : true};
                }
        }} else {
            global.games.set(interaction.guild.id, []); 
            global.gameInfo.set(interaction.guild.id, []);
            global.hands.set(interaction.guild.id, new Map());
            let gameUsers = global.games.get(interaction.guild.id);
            gameUsers.push(interaction.user);
            let gameHands = global.hands.get(interaction.guild.id);
            gameHands.set(interaction.user, []);
            userNames = [];
            gameUsers.forEach((user) => userNames.push(`${user.displayName}`));
            reply = codeBlock('md', `No active game found, created new game!
current members:
# ${userNames}`);
        }
        await interaction.reply(reply);
    },
};