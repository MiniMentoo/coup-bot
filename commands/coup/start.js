const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const {cardType} = require('../../config.json');
const {shuffle} = require('../../turn-utils.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Starts the game and deals each player their cards.'),
	async execute(interaction) {
        let reply = ``;
		let doConfirm = false;
		if (global.games.has(interaction.guild.id)) {
			if (! global.gameInfo.get(interaction.guild.id).length == 0){
				reply = {content: `Game has already started! Wait for it to end!`, ephemeral : true};
			} else {
            let gameUsers = global.games.get(interaction.guild.id);
			let turn = global.turns.get(interaction.guild.id);
			let turnPlayer = gameUsers[turn];
            if (gameUsers.length < 3) {
                const confirm = new ButtonBuilder()
			    .setCustomId('confirm')
			    .setLabel('Confirm start')
			    .setStyle(ButtonStyle.Primary);

		        const cancel = new ButtonBuilder()
			    .setCustomId('cancel')
			    .setLabel('Cancel')
			    .setStyle(ButtonStyle.Secondary);

                const row = new ActionRowBuilder()
			    .addComponents(cancel, confirm);

				doConfirm = true;
                reply = {
                    content: `You have less than 3 players in the game, are you sure you want to start?`,
                    components: [row],
                }
			} else if (gameUsers.length > 7) {
				let bonus = Math.floor((gameUsers.length - 6)/2);
				startGame(bonus, interaction.guild.id);
				reply = `Game started with extra people, added ${bonus} extra copy of each card to deck, for a total of ${bonus + 3}. Do /hand to see your hand
${turnPlayer} it's your turn, do /turn to take it`;
			} else {
				startGame(0, interaction.guild.id);
				reply = `Game started, do /hand to see your hand!
${turnPlayer} it's your turn, do /turn to take it`;
			}
        }} else {
            reply = {content : `There is no game to start! You can start one by doing /join!`, ephemeral : true};
        }
		const response = await interaction.reply(reply);
		const collectorFilter = i => i.user.id === interaction.user.id;
		if (doConfirm){
			try {
				const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
				if (confirmation.customId === 'confirm') {
					startGame(0, interaction.guild.id);
					let gameUsers = global.games.get(interaction.guild.id);
					let turn = global.turns.get(interaction.guild.id);
					let turnPlayer = gameUsers[turn];
					await confirmation.update({ content: `Game started, do /hand to see your hand!
${turnPlayer} it's your turn, do /turn to take it`, components: [] });
				} else if (confirmation.customId === 'cancel') {
					await confirmation.update({ content: 'Action cancelled', components: [] });
				}
			} catch (e) {
				console.log(e);
				await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
			}
		}
	},
};

function startGame(bonus, guildId) {
	const quantity = 3 + bonus;
	const length = cardType.length;
	let deck = [];
	for(let i = 0; i < length; i++){
		for(let j = 0; j < quantity; j++){
			deck.push(i); 
		}
	}
	deck = shuffle(deck);
	let players = global.games.get(guildId);
	let gameHands = global.hands.get(guildId);
	players.forEach(player => {
		let hand = gameHands.get(player);
		hand.push(deck.splice(0,2)); //the two cards drawn added to first position in hand
		hand.push(2); //int representing number of coins second position
		hand.push(["",""]); //third position represents revealed (unusable) cards
		hand.push(true); //bool representing if player is still in game
	});
	global.gameInfo.set(guildId, deck);
	console.log(global.gameInfo); //leaving this in for testing purposes delete later
}