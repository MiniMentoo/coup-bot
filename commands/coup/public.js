const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { cardEmoji } = require('../../config.json');


module.exports = {
    data : new SlashCommandBuilder()
        .setName('public')
        .setDescription('Shows all public information'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
        .setTitle(`Public information`)
        .setColor( 0xbebebb )
        .setThumbnail('https://imgur.com/fgo1Tls.png');
        const hands = global.hands.get(interaction.guild.id);
        const players = global.games.get(interaction.guild.id);
        const turn = global.turns.get(interaction.guild.id);
        let counter = 0;
        embed.addFields(
            { name: 'Players', value: `${players}
It's ${players[turn]}'s turn right now` },
            { name: '\u200B', value: '\u200B' });
        hands.forEach((hand) => counter = addPlayerInfoToEmbed(counter, hand, players, embed));
        await interaction.reply({embeds : [embed]});
    },
};

function addPlayerInfoToEmbed(counter, hand, players, embed) { //want to add ping to each user, and show question marks for unrevealed cards, and relevant emoji for revealed cards, remember some type of coin display and isOut display
    let player = players[counter];
    counter +=1;
    let unknown = '';
    if (hand[0][0] == -1){
        unknown += cardEmoji[hand[2][0]]; //assumes if slot in hand is empty, it's put into the revealed slot
    } else {
        unknown += "❓";
    }
    if (hand[0][1] == -1){
        unknown += cardEmoji[hand[2][1]];
    } else {
        unknown += "❓";
    }
    let alive = '';
    if (hand[3]) {
        alive += "✅";
    } else {
        alive += "❌";
    }
    embed.addFields(
        { name: `${player.displayName}'s cards`, value: `${unknown}`, inline: true },
        { name: 'Coins', value: `${hand[1]}`, inline: true },
        { name: `Still alive?`, value : `${alive}`, inline: true},
        { name: '\u200B', value: '\u200B' },
    )

    return counter;
}