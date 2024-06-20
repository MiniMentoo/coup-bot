const { SlashCommandBuilder, codeBlock} = require('discord.js');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('hand')
        .setDescription('shows you your hand'),
    async execute(interaction) {
        let reply = `temp`;
        if (global.hands.has(interaction.guild.id)){
            let serverHands = global.hands.get(interaction.guild.id);
            if (serverHands.has(interaction.user)) {
                let userHand = serverHands.get(interaction.user);
                if (userHand.length == 0){
                    reply = codeBlock('md', `Your hand is currently empty!`)
                } else {
                    reply = displayHand(userHand);}
            } else {
                reply = {content : `You don't have a hand in this server yet, do /join and wait for the game to start!`, ephemeral : false};
            }
        } else {
            reply = {content : `This server doesn't have a game yet! Try making one with /join`, ephemeral : true};
        }
        await interaction.reply(reply);
    },
};

function displayHand(userHand) {
    card1 = userHand[0][0];
    card2 = userHand[0][1];
    coins = userHand[1];
    shown = userHand[2];
    let isIn ='';
    let revealed = shown;
    if (! shown.length) {
        revealed = 'no cards'
    }
    if (! userHand[3]) {
        isIn = "You're out of the game :(";
    }

    return {content: `${isIn}
1: ${card1} 2: ${card2}
You have ${coins} coins,
You have lost ${revealed}`, ephemeral : false} //set this to true after done testing
}