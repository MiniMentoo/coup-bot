const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { cardType, cardEmoji } = require('./config.json');


function endTurn(action, serverId, players) {
    let turn = (global.turns.get(serverId) + 1) % players.length;
    global.turns.set(serverId, turn);
    action.followUp({content: `${players[turn]} it's your turn, do /turn to take it`});
}

function performChallenge(interaction, ) {

}

async function loseInfluence(interaction, player) {
    let hand = global.hands.get(interaction.guild.id).get(player);
    let reply = "empty";
    let deployedButtons = false;
    if (hand[0][0] != "" && hand[0][1] != "") {
        const one = new ButtonBuilder()
            .setCustomId("one")
            .setLabel("lose the first card")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('1️⃣');
        
        const two = new ButtonBuilder()
            .setCustomId("two")
            .setLabel("lose the second card")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('2️⃣');

        const row = new ActionRowBuilder()
            .addComponents(one, two);
        
        reply = {content : `${player} You're losing one influence, please press the button corresponding to which card you want to reveal, and lose influence of (you can do /hand to privately see your own hand).`, components: [row]};
        
    } else {
        hand[3] = false; //the player is now out
        let revealed;
        if (hand[0][0] == "") {
            hand[2][1] = hand[0][1];
            hand[0][1] == "";
            revealed = hand[2][1]
        } else {
            hand[2][0] = hand[0][0];
            hand[0][0] == "";
            revealed = hand[2][0];
        }
        reply = `${player} is out of the game! They had ${cardType[revealed]} ${cardEmoji[revealed]}`
    }
    const response = await interaction.followUp(reply);
    if (deployedButtons) {
        const collectorFilter = i => i.user === player;
        try {
            let hand = global.hands.get(interaction.guild.id).get(player);
            let reply2 = "";
            const choice = await response.awaitMessageComponent({ filter: collectorFilter, time: 3000000 });
            if (choice.customId == "one") {
                hand[2][0] = hand[0][0];
                hand[0][0] = "";
                reply2 = `${player} has revealed the ${cardType[hand[2][0]]} ${cardEmoji[hand[2][0]]}, they have 1 card left hidden!`
            } else {
                hand[2][1] = hand[0][1];
                hand[0][1] = "";
                reply2 = `${player} has revealed the ${cardType[hand[2][1]]} ${cardEmoji[hand[2][1]]}, they have 1 card left hidden!`
            }
            await interaction.followUp(reply2);
        } catch (e) {
            console.log(e)

        }
    }
}


module.exports = {
    endTurn
};