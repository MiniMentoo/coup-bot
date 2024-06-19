const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Starts the game and deals each player their cards.'),
	async execute(interaction) {
        let reply = ``;
		if (global.games.has(interaction.guild.id)) {
            let gameUsers = global.games.get(interaction.guild.id);
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

                reply = {
                    content: `You have less than 3 players in the game, are you sure you want to start?`,
                    components: [row],
                }
            }
        } else {
            reply = {content : `There is no game to start! You can start one by doing /join!`, ephemeral : true};
        }
		const response = await interaction.reply(reply);
		const collectorFilter = i => i.user.id === interaction.user.id;
		try {
			const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });

			if (confirmation.customId === 'confirm') {
				startGame;
				await confirmation.update({ content: `Game started, do /hand to see your hand!`, components: [] });
			} else if (confirmation.customId === 'cancel') {
				await confirmation.update({ content: 'Action cancelled', components: [] });
			}
	} catch (e) {
		await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
	}
	},
};



function startGame() {

}