import { EmbedBuilder } from 'discord.js';
import { StudyGroup } from '../../models/StudyGroupModel';
import { LanguageService } from '../../utils/LanguageService';
import moment from 'moment-timezone';

export async function getGroups(interaction: any) {
	const page = interaction.options.getInteger('page') || 1;
	const limit = 5; 
	const skip = (page - 1) * limit;

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.group.listGroup;

	try {
		const totalGroups = await StudyGroup.countDocuments({
			members: interaction.user.id
		});

		const totalPages = Math.ceil(totalGroups / limit);

		const groups = await StudyGroup.find({
			members: interaction.user.id
		})
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit);

		if (groups.length === 0) {
			await interaction.reply({
				content: strings.noGroups,
				ephemeral: true
			});
			return;
		}

		const embed = new EmbedBuilder()
			.setTitle(strings.list.title)
			.setDescription(
				strings.list.description
				.replace('{page}', page)
				.replace('{totalPages}', totalPages)
			)
			.setColor('#00ff00')
			.setTimestamp();

		groups.forEach(group => {
			const isOwner = group.ownerId === interaction.user.id;
			const memberCount = group.members.length;
			const createdAt = moment(group.createdAt).format('YYYY-MM-DD');

			embed.addFields({
				name: `${isOwner ? '👑' : '👤'} ${group.name}`,
				value: [
					`ID: \`${group._id}\``,
					`${strings.fields.description}: ${group.description ?? strings.fields.noDescription}`,
					`${strings.fields.members}: ${memberCount}`,
					`${strings.fields.created}: ${createdAt}`,
					`${strings.fields.yourRole}: ${isOwner ? strings.fields.owner : strings.fields.member}`
				].join('\n'),
				inline: false
			});
		});

		// Add pagination footer
		if (totalPages > 1) {
			embed.setFooter({
				text: strings.footer.replace('{totalPages}', totalPages)
			});
		}

		await interaction.reply({ embeds: [embed], ephemeral: true });

	} catch (error) {
		console.error('Error fetching groups:', error);
		await interaction.reply({
			content: strings.error,
			ephemeral: true
		});
	}
}