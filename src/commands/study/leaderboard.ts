import { CommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } from 'discord.js';
import { TimeStudySession } from '../../models/TimeStudySession';

export async function displayLeaderboard(interaction: CommandInteraction) {
	// Fetch leaderboard data
	const leaderboardData = await TimeStudySession.aggregate([
		{ $match: { finishTime: { $exists: true } } },
		{ 
			$group: { 
				_id: '$userId', 
				totalDuration: { $sum: '$duration' } 
			} 
		},
		{ $sort: { totalDuration: -1 } },
		{ $limit: 100 }
	]);

	if (leaderboardData.length === 0) {
		await interaction.reply({
			content: '🏆 No study data available for the leaderboard.',
			ephemeral: true,
		});
		return;
	}

	const itemsPerPage = 10;
	const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);
	let currentPage = 1;

	const generateEmbed = async (page: number) => {
		const start = (page - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		const currentData = leaderboardData.slice(start, end);

		const embed = new EmbedBuilder()
			.setTitle('🏆 Study Leaderboard')
			.setColor('#FFD700')
			.setFooter({ text: `Page ${page} of ${totalPages}` })
			.setTimestamp();

		let description = '';
		for (let i = 0; i < currentData.length; i++) {
			const rank = start + i + 1;
			const user = interaction.client.users.cache.get(currentData[i]._id) || await interaction.client.users.fetch(currentData[i]._id).catch(() => null);
			const username = user ? user.username : 'Unknown User';
			const duration = formatDuration(currentData[i].totalDuration);
			description += `${rank}. **${username}** - ${duration}\n`;
		}

		embed.setDescription(description);
		return embed;
	};

	const formatDuration = (seconds: number): string => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${hours}h ${minutes}m`;
	};

	const embed = await generateEmbed(currentPage);

	const prevButton = new ButtonBuilder()
		.setCustomId('prev')
		.setLabel('Previous')
		.setStyle(ButtonStyle.Primary)
		.setDisabled(currentPage === 1);

	const nextButton = new ButtonBuilder()
		.setCustomId('next')
		.setLabel('Next')
		.setStyle(ButtonStyle.Primary)
		.setDisabled(currentPage === totalPages);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prevButton, nextButton);

	const message = await interaction.reply({
		embeds: [embed],
		components: [row],
		fetchReply: true,
	});

	const filter = (i: any) => i.user.id === interaction.user.id && ['prev', 'next'].includes(i.customId);
	const collector = message.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

	collector.on('collect', async (i) => {
		if (i.customId === 'prev' && currentPage > 1) {
			currentPage--;
		} else if (i.customId === 'next' && currentPage < totalPages) {
			currentPage++;
		}

		prevButton.setDisabled(currentPage === 1);
		nextButton.setDisabled(currentPage === totalPages);
		const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(prevButton, nextButton);

		const newEmbed = await generateEmbed(currentPage);
		await i.update({ embeds: [newEmbed], components: [newRow] });
	});

	collector.on('end', async () => {
		const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			prevButton.setDisabled(true),
			nextButton.setDisabled(true)
		);
		await message.edit({ components: [disabledRow] });
	});
}