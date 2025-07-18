import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { Flashcard, Visibility } from '../../models/FlashcardModel';
import { StudyGroup } from '../../models/StudyGroupModel';
import moment from 'moment-timezone';
import { LanguageService } from '../../utils/LanguageService';

export async function listFlashcards(interaction: any) {
	const initialPage = interaction.options.getInteger('page') ?? 1;
	const visibility = interaction.options.getInteger('visibility');
	const limit = 5;

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.flashcard.listFlashcards;

	async function generateEmbed(page: number) {
		const skip = (page - 1) * limit;
		let query = Flashcard.find();
		switch (visibility) {
			case Visibility.Private:
				query.where('user').equals(interaction.user.id);
				break;
			case Visibility.Public:
				query.where('visibility').equals(Visibility.Public);
				break;
			case Visibility.GroupShared:
				const userGroups = await StudyGroup.find({ members: interaction.user.id });
				const groupIds = userGroups.map((g: any) => g._id.toString());
				query.where('groupIds').in(groupIds);
				break;
			default:
				const groups = await StudyGroup.find({ members: interaction.user.id });
				const gIds = groups.map((g: any) => g._id.toString());
				query.or([
					{ user: interaction.user.id },
					{ visibility: Visibility.Public },
					{ groupIds: { $in: gIds } }
				]);
		}

		const total = await Flashcard.countDocuments(query);
		const totalPages = Math.ceil(total / limit);

		const flashcards = await query
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const embed = new EmbedBuilder()
			.setTitle(strings.title)
			.setDescription(
				strings.description
					.replace('{page}', page.toString())
					.replace('{totalPages}', totalPages.toString())
			)
			.setColor('#00ff00')
			.setTimestamp();

		flashcards.forEach((card, index) => {
			const topic = card.topic ? `[${card.topic}]` : '';
			const visibility = card.visibility === Visibility.Public ? '🌐' : 
												card.visibility === Visibility.GroupShared ? '👥' : '🔒';
			embed.addFields({
				name: `${visibility} Flashcard ${skip + index + 1}`,
				value: [
					`**${strings.question}**: ${card.question}`,
					`**${strings.topic}**: ${topic.length > 0 ? topic : strings.none}`,
					`**${strings.created}**: ${moment(card.createdAt).format('YYYY-MM-DD')}`,
					`**ID**: \`${card._id}\``
				].join('\n')
			});
		});

		if (totalPages > 1) {
			embed.setFooter({ text: strings.footer.replace('{totalPages}', totalPages.toString()) });
		}

		return { embed, totalPages };
	}

	try {
		const { embed, totalPages } = await generateEmbed(initialPage);
		
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('previous')
					.setLabel('◀')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(initialPage === 1),
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('▶')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(initialPage === totalPages)
			);

		const response = await interaction.reply({
			embeds: [embed],
			components: [row],
			ephemeral: true
		});

		const collector = response.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 60000
		});

		let currentPage = initialPage;

		collector.on('collect', async (i: any) => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({ content: strings.notYourButtons, ephemeral: true });
				return;
			}

			currentPage = i.customId === 'previous' ? currentPage - 1 : currentPage + 1;
			const { embed, totalPages } = await generateEmbed(currentPage);

			const newRow = new ActionRowBuilder<ButtonBuilder>()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('previous')
						.setLabel('◀')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(currentPage === 1),
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel('▶')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(currentPage === totalPages)
				);

			await i.update({
				embeds: [embed],
				components: [newRow]
			});
		});

		collector.on('end', () => {
			row.components.forEach(component => component.setDisabled(true));
			interaction.editReply({
				components: [row]
			}).catch(console.error);
		});

	} catch (error) {
		console.error('Error listing flashcards:', error);
		await interaction.reply({
			content: strings.error,
			ephemeral: true
		});
	}
}