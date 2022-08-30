require('dotenv').config();
const discord = require('discord.js');
const axios = require('axios');
const TOKEN = process.env.TOKEN;
const client = new discord.Client({
	intents: [
		discord.IntentsBitField.Flags.Guilds,
		discord.IntentsBitField.Flags.GuildMessages,
	],
});

client.on('ready', () => {
	console.log('bot is ready');
	const guildId = '703708309185757235';
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
	commands.create({
		name: 'hi',
		description: 'searches for player',
	});
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;
	const { commandName, options } = interaction;
	if (commandName === 'hi') {
		interaction.reply({
			content: 'hi',
		});
	}
	if (commandName === 'search') {
		const search = options.getString('query');
		console.log(search);

		await interaction.deferReply();

		const { data } = await axios.post(
			'https://5m8926z2t3.execute-api.us-east-1.amazonaws.com/api/points',
			{ search },
			{ validateStatus: false }
		);

		console.log('hi', data);

		interaction.editReply({
			content: JSON.stringify(data),
		});
	}
});

client.login(TOKEN);
