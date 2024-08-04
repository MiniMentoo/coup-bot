const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const {endTurn, loseInfluence, performChallenge, shuffle} = require('../../turn-utils.js');
const {cardType, cardEmoji, thinkingTime} = require('../../config.json');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('exchange')
        .setDescription('perform the exchange action, if it is your turn'),
    async execute(interaction) {
        let reply = 'empty';
        let deployedButtons = false;
        if (global.games.has(interaction.guild.id) && (!global.gameInfo.get(interaction.guild.id).length == 0)){
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            let hands = global.hands.get(interaction.guild.id);
            if (interaction.user == players[turn]) {
                deployedButtons = true;
                
                const challenge = new ButtonBuilder()
                .setCustomId('challenge')
                .setLabel('Challenge')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌');

                const noBlocksEnabled = new ButtonBuilder()
                .setCustomId('noBlocks')
                .setLabel('No Blocks / Challenges')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('✅')
                .setDisabled(false);

                const row = new ActionRowBuilder()
                .addComponents(challenge, noBlocksEnabled);

                reply = {content : `${interaction.user} is claiming Ambassador ${cardEmoji[2]} and attempting the exchange action
They will draw 2 cards from the deck and pick which roles to keep (they cannot replace revealed cards). This action can only be challenged!`, components : [row]};
            } else {
                reply = {content : `You are not the turn player! It's ${players[turn]} turn right now`, ephemeral : true};
            }
        } else {
            reply = {content : `There either isn't a game in this server, or it hasn't been /start 'ed yet`, ephemeral : true};
        }

        const response = await interaction.reply(reply);
        if (deployedButtons){
            let hands = global.hands.get(interaction.guild.id);
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            const collectorFilter = i => players.includes(i.user);
            const deck = global.gameInfo.get(interaction.guild.id);
            const hand = hands.get(interaction.user);

            try {
                const action = await response.awaitMessageComponent({filter : collectorFilter, time: thinkingTime});
                await interaction.editReply({components : []});
                if (action.customId == "noBlocks") {
                    await action.reply({content: `Exchange going through`, components : []});
                    let card1 = deck.splice(0,1)[0];
                    let card2 = deck.splice(0,1)[0];
                    await interaction.followUp({content : `Drew the ${cardType[card1]} ${cardEmoji[card1]} and the ${cardType[card2]} ${cardEmoji[card2]}, pick cards to keep in your hand (the total number of cards you have must stay the same)`, ephemeral : true})
                    if (hand[0][0] == -1) {
                        hand[0][1] = await pickOne(card1, card2, hand[0][1], interaction);
                    } else if (hand[0][1] == -1) {
                        hand[0][0] = await pickOne(card1, card2, hand[0][0], interaction);
                    } else {
                        choices = await pickTwo(card1, card2, hand[0][0], hand[0][1], interaction);
                        hand[0][0] = choices[0];
                        hand[0][1] = choices[1];  
                    }
                } else {
                    await action.reply(`${action.user} has challenged ${interaction.user}`);
                    if (! await performChallenge(action, action.user, interaction.user, 2)) {
                        await action.followUp({content: `Exchange going through`, components : []});
                        let card1 = deck.splice(0,1)[0];
                        let card2 = deck.splice(0,1)[0];
                        await interaction.followUp({content : `Drew the ${cardType[card1]} ${cardEmoji[card1]} and the ${cardType[card2]} ${cardEmoji[card2]}, pick cards to keep in your hand (the total number of cards you have must stay the same)`, ephemeral : true})
                        if (hand[0][0] == -1) {
                            hand[0][1] = await pickOne(card1, card2, hand[0][1], interaction);
                        } else if (hand[0][1] == -1) {
                            hand[0][0] = await pickOne(card1, card2, hand[0][0], interaction);
                        } else {
                            choices = await pickTwo(card1, card2, hand[0][0], hand[0][1], interaction);
                            hand[0][0] = choices[0];
                            hand[0][1] = choices[1];  
                        }
                    } else {
                        await action.followUp(`Exchange action failed as the challenge succeeded, turn passed.`);
                    }
                }
                await endTurn(action, interaction.guild.id, players);
            } catch(e) {
                console.log(e);
                await action.update({content: `Buttons timed out, exchange going through`, components : []});
                await endTurn(action, interaction.guild.id, players);
            }
        }
    }       
};


async function pickOne(card1, card2, card3, interaction) {
    
    const return1 = new ButtonBuilder()
                .setCustomId('return1')
                .setLabel(`${cardType[card1]}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(`${cardEmoji[card1]}`);

    const return2 = new ButtonBuilder()
                .setCustomId('return2')
                .setLabel(`${cardType[card2]}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(`${cardEmoji[card2]}`);
    
    const return3 = new ButtonBuilder()
                .setCustomId('return3')
                .setLabel(`${cardType[card3]}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(`${cardEmoji[card3]}`);

    const row = new ActionRowBuilder()
        .addComponents(return1, return2, return3);

    const response = await interaction.followUp({content : `${interaction.user}, pick the card you'll keep in your hand, the other two will go into the deck`, 
        components : [row], ephemeral : true});
    let players = global.games.get(interaction.guild.id);
    const collectorFilter = i => players.includes(i.user);
    const action = await response.awaitMessageComponent({filter : collectorFilter, time: thinkingTime});
    const deck = global.gameInfo.get(interaction.guild.id);
    try {
        if (action.customId == 'return1') {
            deck.push(card2);
            deck.push(card3);
            shuffle(deck);
            await interaction.followUp({content : `Chosen ${cardType[card1]} ${cardEmoji[card1]} to keep in hand`, ephemeral : true});
            await action.update({components : []});
            return card1;
        } else if (action.customId == 'return2') {
            deck.push(card1);
            deck.push(card3);
            shuffle(deck);
            await interaction.followUp({content : `Chosen ${cardType[card2]} ${cardEmoji[card2]} to keep in hand`, ephemeral : true});
            await action.update({components : []});
            return card2;
        } else {
            deck.push(card1);
            deck.push(card2);
            shuffle(deck);
            await interaction.followUp({content : `Chosen ${cardType[card3]} ${cardEmoji[card3]} to keep in hand`, ephemeral : true});
            await action.update({components : []});
            return card3;
        }
    } catch(e) {
        console.log(e);
        await interaction.followUp({content : `Choice timed out, picked ${cardType[card1]} ${cardEmoji[card1]} to keep in hand`, ephemeral : true});
    }
}

async function pickTwo(card1, card2, card3, card4, interaction) {
    choices = [];
    
    const return1 = new ButtonBuilder()
                .setCustomId('return1')
                .setLabel(`${cardType[card1]}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(`${cardEmoji[card1]}`);

    const return2 = new ButtonBuilder()
                .setCustomId('return2')
                .setLabel(`${cardType[card2]}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(`${cardEmoji[card2]}`);
    
    const return3 = new ButtonBuilder()
                .setCustomId('return3')
                .setLabel(`${cardType[card3]}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(`${cardEmoji[card3]}`);

    const return4 = new ButtonBuilder()
                .setCustomId('return4')
                .setLabel(`${cardType[card4]}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(`${cardEmoji[card4]}`);

    const row = new ActionRowBuilder()
        .addComponents(return1, return2, return3, return4);

    const response = await interaction.followUp({content : `${interaction.user}, pick 2 cards you'll keep in your hand, the other two will go into the deck`, 
        components : [row], ephemeral : true});
    let players = global.games.get(interaction.guild.id);
    const collectorFilter = i => players.includes(i.user);
    const action = await response.awaitMessageComponent({filter : collectorFilter, time: thinkingTime});
    const deck = global.gameInfo.get(interaction.guild.id);
    try {
        if (action.customId == 'return1') {
            choices.push(card1);
            await interaction.followUp({content : `Chosen ${cardType[card1]} ${cardEmoji[card1]} to keep in hand`, ephemeral : true});
            await action.update({components : []});
            choices.push(await pickOne(card2, card3, card4, interaction));
        } else if (action.customId == 'return2') {
            choices.push(card2);
            await interaction.followUp({content : `Chosen ${cardType[card2]} ${cardEmoji[card2]} to keep in hand`, ephemeral : true});
            await action.update({components : []});
            choices.push(await pickOne(card1, card3, card4, interaction));
        } else if (action.customId == 'return3') {
            choices.push(card3);
            await interaction.followUp({content : `Chosen ${cardType[card3]} ${cardEmoji[card3]} to keep in hand`, ephemeral : true});
            await action.update({components : []});
            choices.push(await pickOne(card1, card2, card4, interaction));
        } else {
            choices.push(card4);
            await interaction.followUp({content : `Chosen ${cardType[card4]} ${cardEmoji[card4]} to keep in hand`, ephemeral : true});
            await action.update({components : []});   
            choices.push(await pickOne(card1, card2, card3, interaction));         
        }
        return choices;
    } catch(e) {
        console.log(e);
        await interaction.followUp({content : `Choice timed out, picked ${cardType[card1]} ${cardEmoji[card1]} to keep in hand`, ephemeral : true});
        choices.push(card1);
        choices.push(await pickOne(card2, card3, card4, interaction));
        return choices;
    }
}