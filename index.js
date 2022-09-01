require('dotenv').config();
const discord = require('discord.js');
const axios = require('axios');
const TOKEN =
	process.env.ENV === 'DEV' ? process.env.DEV_TOKEN : process.env.PROD_TOKEN;
const client = new discord.Client({
	intents: [
		discord.IntentsBitField.Flags.Guilds,
		discord.IntentsBitField.Flags.GuildMessages,
	],
});
client.on('ready', () => {
	console.log(`Bot is running on: ${process.env.ENV}`);
	const guildId = process.env.SERVER_CODE;

	const guild = client.guilds.cache.get(guildId);
	let commands;
	if (guild) {
		commands = guild.commands;
	} else {
		commands = client.application.commands;
	}
	commands.create({
		name: 'search',
		description: 'searches for player',
		options: [
			{
				name: 'query',
				description: 'input player name',
				required: true,
				type: discord.ApplicationCommandOptionType.String,
			},
		],
	});
});

client.on('interactionCreate', async (interaction) => {
	try {
		if (!interaction.isCommand()) return;
		const { commandName, options } = interaction;
		if (commandName === 'search') {
			const search = options.getString('query');

			await interaction.deferReply();

			const { data } = await axios.post(
				'https://5m8926z2t3.execute-api.us-east-1.amazonaws.com/api/points',
				{ search },
				{ validateStatus: false }
			);
			
			if (data?.players) {
				const embeds = [];
				data.players.forEach(
					({ screen_name, avatar, rank, score, country }) => {
						embeds.push({
							title: screen_name,
							image: {
								url: avatar,
							},
							fields: [
								{
									name: 'Rank',
									value: rank,
								},
								{
									name: 'Points',
									value: score,
								},
								{
									name: 'Country',
									value: country,
								},
							],
						});
					}
				);
				interaction.editReply({
					embeds,
				});
			} else if (data && data.status !== 200) {
				interaction.editReply({
					content: data.message,
				});
			} else {
				interaction.editReply({
					content: 'No results found',
				});
			}
		}
	} catch (error) {
		interaction.editReply({
			content: 'There was an error with the bot please try again later',
		});
	}
});

client.login(TOKEN);
