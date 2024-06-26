const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { cardType, cardEmoji, thinkingTime } = require('./config.json');


async function endTurn(action, serverId, players) {
    let turn = (global.turns.get(serverId) + 1) % players.length;
    global.turns.set(serverId, turn);
    await action.followUp({content: `${players[turn]} it's your turn, do /turn to take it`});
}

async function performChallenge(interaction, challenger, challengee, card) {
    const giveUp = new ButtonBuilder()
        .setCustomId('giveUp')
        .setLabel(`Don't reveal (lose challenge)`)
        .setStyle(ButtonStyle.Danger)
        .setEmoji('💀');
    
    const reveal = new ButtonBuilder()
        .setCustomId('reveal')
        .setLabel(`Reveal a ${cardType[card]}`)
        .setStyle(ButtonStyle.Success)
        .setEmoji('✋');

    const row = new ActionRowBuilder()
        .addComponents(giveUp, reveal);
    
    const response = await interaction.followUp({content: `${challenger} is challenging ${challengee}'s claim that they hold a ${cardType[card]} ${cardEmoji[card]}the loser of this challenge will lose influence!
${challengee} choose to either forfeit the challenge (losing an influence) or reveal the card (fails unless you hold the ${cardType[card]} ${cardEmoji[card]})
If you successfully reveal a ${cardType[card]} then it will be put back into the deck and you will draw a random card`, components : [row]});
    
    const collectorFilter = i => i.user === challengee;
    try {
        const hand = global.hands.get(interaction.guild.id).get(challengee);
        const deck = global.gameInfo.get(interaction.guild.id);
        let reply2 = "";
        const choice = await response.awaitMessageComponent({ filter: collectorFilter, time: thinkingTime });
        let loser;
        let challengeSuccessful;
        if (choice.customId == "giveUp") {
            await choice.reply(`${challengee} has refused to reveal the ${cardType[card]} and failed the challenge`);
            loser = challengee;
            challengeSuccessful = true;
        } else {
            if (hand[0][0] == card) {
                deck.push(hand[0][0]);
                shuffle(deck);
                hand[0][0] = deck.splice(0,1);
                loser = challenger;
                challengeSuccessful = false;
                reply2 = `${challengee} has revealed the ${cardType[card]} ${cardEmoji[card]} and won the challenge. The card has been put into the deck and a new one was drawn at random.
${challenger} has lost the challenge and will lose an influence.`
            } else if (hand[0][1] == card) {
                deck.push(hand[0][1]);
                shuffle(deck);
                hand[0][1] = deck.splice(0,1);
                loser = challenger;
                challengeSuccessful = false;
                reply2 = `${challengee} has revealed the ${cardType[card]} ${cardEmoji[card]} and won the challenge. The card has been put into the deck and a new one was drawn at random.
${challenger} has lost the challenge and will lose an influence.`;
            } else {
                loser = challengee;
                challengeSuccessful = true;
                reply2 = `${challengee} could not reveal the ${cardType[card]} ${cardEmoji[card]} and has failed the challenge.`;
            }
            await choice.reply(reply2);
        }
        await loseInfluence(choice, loser);
        return challengeSuccessful;
    } catch(e) {
        console.log(e);
        await interaction.followUp(`${challengee} failed to respond, they failed the challenge automatically`);
        await loseInfluence(interaction, challengee);
        return true;
    }
}

async function loseInfluence(interaction, player) {
    let hand = global.hands.get(interaction.guild.id).get(player);
    let reply = "empty";
    let deployedButtons = false;
    console.log(hand);
    if ((hand[0][0] != -1) && (hand[0][1] != -1)) {
        const one = new ButtonBuilder()
            .setCustomId("one")
            .setLabel(`lose the first card`)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(`1️⃣`);
        
        const two = new ButtonBuilder()
            .setCustomId("two")
            .setLabel(`lose the second card`)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(`2️⃣`);

        const row = new ActionRowBuilder()
            .addComponents(one, two);
        
        deployedButtons = true;
        reply = {content : `${player} You're losing one influence, please press the button corresponding to which card you want to reveal, and lose influence of (you can do /hand to privately see your own hand).`, components: [row], ephemeral : false};
        
    } else {
        hand[3] = false; //the player is now out
        let revealed;
        if (hand[0][0] == -1) {
            hand[2][1] = hand[0][1];
            hand[0][1] = -1;
            revealed = hand[2][1]
        } else {
            hand[2][0] = hand[0][0];
            hand[0][0] = -1;
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
            const choice = await response.awaitMessageComponent({ filter: collectorFilter, time: thinkingTime });
            if (choice.customId == "one") {
                hand[2][0] = hand[0][0];
                hand[0][0] = -1;
                reply2 = `${player} has revealed the ${cardType[hand[2][0]]} ${cardEmoji[hand[2][0]]}, they have 1 card left hidden!`
            } else {
                hand[2][1] = hand[0][1];
                hand[0][1] = -1;
                reply2 = `${player} has revealed the ${cardType[hand[2][1]]} ${cardEmoji[hand[2][1]]}, they have 1 card left hidden!`
            }
            await choice.reply(reply2);
        } catch (e) {
            console.log(e)
            hand[2][0] = hand[0][0];
            hand[0][0] = -1;
            await interaction.followUp(`${player} has failed to respond, revealed the ${cardType[hand[2][0]]} ${cardEmoji[hand[2][0]]}, they have 1 card left hidden!`);
        }
    }
}

function shuffle(deck) {
	len = deck.length;
	for (let i = len -1; i > 0; i --) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
	return deck;
}

module.exports = {
    endTurn,
    loseInfluence,
    performChallenge,
    shuffle
};