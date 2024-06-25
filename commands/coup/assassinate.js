const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const {endTurn, loseInfluence, performChallenge} = require('../../turn-utils.js');
const {cardType, cardEmoji, thinkingTime} = require('../../config.json');

module.exports = {
    data : new SlashCommandBuilder()
        .setName('assassinate')
        .setDescription('perform the assassinate action, if it is your turn')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('the target of the assassination')
                .setRequired(true)),
    async execute(interaction) {
        let reply = 'empty';
        let deployedAction = false;
        const target = interaction.options.getUser('target');
        if (global.games.has(interaction.guild.id) && (!global.gameInfo.get(interaction.guild.id).length == 0)){
            let players = global.games.get(interaction.guild.id);
            let turn = global.turns.get(interaction.guild.id);
            let hands = global.hands.get(interaction.guild.id);
            if (interaction.user == players[turn]) {
                if (players.includes(target) && hands.get(target)[3]) {
                    if (hands.get(interaction.user)[1] >= 3) {
                        deployedAction = true;
                        hands.get(players[turn])[1] = hands.get(players[turn])[1] - 3;

                        const contessaBlock = new ButtonBuilder()
                        .setCustomId('contessaBlock')
                        .setLabel(`Block with Contessa`)
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji(cardEmoji[4]);
            
                        const noBlocks = new ButtonBuilder()
                        .setCustomId('noBlocks')
                        .setLabel('No Blocks / Challenges')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('✅');
            
                        const challenge = new ButtonBuilder()
                        .setCustomId('challenge')
                        .setLabel('Challenge')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('❌');

                        const row = new ActionRowBuilder()
                            .addComponents(challenge, contessaBlock, noBlocks);
                        
                        reply = {content: `${interaction.user} has spent 3 coins to attempt an assassination on ${target}
They now have ${hands.get(interaction.user)[1]} coins. This action can be challenged by anyone or blocked with contessa.`, components : [row]};
                    } else {
                        reply = {content : `An assassination requires 3 coins, and you only have ${hands.get(interaction.user)[1]}`, ephemeral : true};
                    }
                } else {
                    reply = {content : `The target isn't part of this game, try again with someone else.`, ephemeral : true};
                }
            } else {
                reply = {content : `You are not the turn player! It's ${players[turn]} turn right now`, ephemeral : true};
            }
        } else {
            reply = {content : `There either isn't a game in this server, or it hasn't been /start 'ed yet`, ephemeral : true};
        }

        await interaction.reply(reply);
        if (deployedAction){
            await loseInfluence(interaction, target);
            await endTurn(interaction, interaction.guild.id, global.games.get(interaction.guild.id));
        }
    }       
};