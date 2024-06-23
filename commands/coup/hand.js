const { SlashCommandBuilder, codeBlock} = require('discord.js');
const {cardType, cardEmoji} = require('../../config.json');


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
                reply = {content : `You don't have a hand in this server yet, do /join and wait for the game to start!`, ephemeral : true};
            }
        } else {
            reply = {content : `This server doesn't have a game yet! Try making one with /join`, ephemeral : true};
        }
        await interaction.reply(reply);
    },
};

function displayHand(userHand) {
    card1 = '❌';
    card2 = '❌';
    coins = userHand[1];
    shown = userHand[2];
    hidden = userHand[0];
    let isIn ='';
    let revealed = '';
    if (shown[0] == -1 && shown[1] == -1) {
        revealed = 'no cards'
    } else {
        if(shown[0] != -1) {
            revealed += cardEmoji[shown[0]];
        }
        if (shown[1] != -1) {
            revealed += cardEmoji[shown[1]];
        }
    }
    if (! userHand[3]) {
        isIn = "You're out of the game :(";
    }
    if (hidden[0] != -1) {
        card1 = `${cardType[hidden[0]]} ${cardEmoji[hidden[0]]}`;
    }
    if (hidden[1] != -1) {
        card2 = `${cardType[hidden[1]]} ${cardEmoji[hidden[1]]}`;
    }
    return {content: `${isIn}
1: ${card1} 2: ${card2}
You have ${coins} coins,
You have lost ${revealed}`, ephemeral : false} //set this to true after done testing
}