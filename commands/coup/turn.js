const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const {cardType, cardEmoji} = require('../../config.json');


module.exports = {
    data : new SlashCommandBuilder()
        .setName('turn')
        .setDescription('takes your turn if it is your turn'),
    async execute(interaction) {
        let reply = "empty response";
        let deployedButtons = false;
        if (global.games.has(interaction.guild.id)) {
            if (global.gameInfo.get(interaction.guild.id).length == 0) {
                reply = {content: `Game has not started yet, do /start before taking your turn!`, ephemeral: true};
            } else{
                let players = global.games.get(interaction.guild.id);
                let turn = global.turns.get(interaction.guild.id);
                if (players[turn] == interaction.user) {
                    const income = new ButtonBuilder()
                    .setCustomId('income')
                    .setLabel(`Income`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💰');

                    const foreign = new ButtonBuilder()
                    .setCustomId('foreignAid')
                    .setLabel(`Foreign Aid`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🇺🇳');

                    const coup = new ButtonBuilder()
                    .setCustomId('coup')
                    .setLabel(`Coup`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✊');

                    const tax = new ButtonBuilder()
                    .setCustomId('tax')
                    .setLabel(`Tax`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(cardEmoji[3]);

                    const assassinate = new ButtonBuilder()
                    .setCustomId('assassinate')
                    .setLabel(`Assassinate`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(cardEmoji[1]);

                    const steal = new ButtonBuilder()
                    .setCustomId('steal')
                    .setLabel(`Steal`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(cardEmoji[0]);

                    const exchange = new ButtonBuilder()
                    .setCustomId('exchange')
                    .setLabel(`Exchange`)
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(cardEmoji[2]);

                    const row1 = new ActionRowBuilder()
                        .addComponents(income, foreign, coup);
                    
                    const row2 = new ActionRowBuilder()
                        .addComponents(tax, assassinate, steal, exchange);

                    const embed = new EmbedBuilder()
                    .setTitle(players[turn].displayName + `'s turn`)
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
                    deployedButtons = true;
                    reply = {content: `${interaction.user} Click the reaction corresponding to the action you want to take. Remember anyone can challenge you if you claim a role!`, embeds : [embed], components : [row1, row2]}
                } else {
                    reply = {content : `You are not the turn player! It's ${players[turn]} turn right now`, ephemeral : true};
                }
            }
        } else {
            reply = {content: `There is no game in this server yet, do /join to make and join one`, ephemeral: true};
        }
        const response = await interaction.reply(reply);
        if (deployedButtons) {
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            let hands = global.hands.get(interaction.guild.id);
            const collectorFilter = i => i.user === players[turn];
            try {
                const action = await response.awaitMessageComponent({ filter: collectorFilter, time: 180000 });
                switch(action.customId){
                    case 'income':
                        hands.get(players[turn])[1] = hands.get(players[turn])[1] + 1;
                        await interaction.deleteReply();
                        await action.reply({content: `${players[turn]} did income and gained one coin, they now have ${hands.get(players[turn])[1]} coins`})
                        break;
                    default:
                        await action.reply({content : `If you're seeing this, something has gone terribly wrong`});
                }
            } catch(e) {
                console.log(e);
                await interaction.followUp({ content : `No choice taken in 3 minutes, timing out. Do /turn again to take your turn.`});
            }
        }
    },
};