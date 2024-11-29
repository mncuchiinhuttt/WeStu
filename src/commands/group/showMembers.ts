import { 
	EmbedBuilder, 
	ActionRowBuilder, 
	ButtonBuilder, 
	ButtonStyle 
} from 'discord.js';
import { StudyGroup } from '../../models/StudyGroupModel';
import { LanguageService } from '../../utils/LanguageService';
import moment from 'moment-timezone';

export async function showMembers(interaction: any) {
	const groupId = interaction.options.getString('group_id');
	let page = interaction.options.getInteger('page') || 1;
	const limit = 10;
	const skip = (page - 1) * limit;

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	const strings = langStrings.commands.group.showMembers;

	try {
		const group = await StudyGroup.findById(groupId);

		if (!group) {
			await interaction.reply({
				content: strings.groupNotFound,
				ephemeral: true
			});
			return;
		}

		const totalMembers = group.members.length;
		const totalPages = Math.ceil(totalMembers / limit);

		const membersSlice = group.members.slice(skip, skip + limit);
		
		const embed = new EmbedBuilder()
			.setTitle(`${strings.members.title} ${group.name}`)
			.setDescription(
				strings.members.description
				.replace('{page}', page.toString())
				.replace('{totalPages}', totalPages.toString())
			)
			.setColor('#00ff00')
			.setTimestamp();

		for (const memberId of membersSlice) {
			const isOwner = group.ownerId === memberId;
			const member = await interaction.guild.members.fetch(memberId);
			
			embed.addFields({
				name: `${isOwner ? '👑' : '👤'} ${member.user.username}`,
				value: [
					`ID: ${memberId}`,
					`${strings.fields.role}: ${isOwner ? strings.fields.owner : strings.fields.member}`,
					`${strings.fields.joinedAt}: ${moment(member.joinedAt).format('YYYY-MM-DD')}`
				].join('\n'),
				inline: false
			});
		}

		if (totalPages > 1) {
			embed.setFooter({
				text: strings.footer.replace('{totalPages}', totalPages.toString())
			});
		}

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('previous')
				.setLabel('⬅️')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(page === 1),
			new ButtonBuilder()
				.setCustomId('next')
				.setLabel('➡️')
				.setStyle(ButtonStyle.Primary)
				.setDisabled(page === totalPages)
		);

		const message = await interaction.reply({ 
			embeds: [embed], 
			components: totalPages > 1 ? [row] : [], 
			ephemeral: true, 
			fetchReply: true 
		});

		if (totalPages > 1) {
			const filter = (i: any) => i.user.id === interaction.user.id;
			const collector = message.createMessageComponentCollector({ filter, time: 60000 });

			collector.on('collect', async (i: any) => {
				page = i.customId === 'previous' ? page - 1 : page + 1;
				const newSkip = (page - 1) * limit;
				const newMembersSlice = group.members.slice(newSkip, newSkip + limit);

				embed.setDescription(
					strings.members.description
					.replace('{page}', page.toString())
					.replace('{totalPages}', totalPages.toString())
				);
				embed.setFields([]);

				for (const memberId of newMembersSlice) {
					const isOwner = group.ownerId === memberId;
					const member = await interaction.guild.members.fetch(memberId);
					
					embed.addFields({
						name: `${isOwner ? '👑' : '👤'} ${member.user.username}`,
						value: [
							`ID: ${memberId}`,
							`${strings.fields.role}: ${isOwner ? strings.fields.owner : strings.fields.member}`,
							`${strings.fields.joinedAt}: ${moment(member.joinedAt).format('YYYY-MM-DD')}`
						].join('\n'),
						inline: false
					});
				}

				row.components[0].setDisabled(page === 1);
				row.components[1].setDisabled(page === totalPages);

				await i.update({ embeds: [embed], components: [row] });
			});

			collector.on('end', () => {
				row.components.forEach(button => button.setDisabled(true));
				interaction.editReply({ components: [row] });
			});
		}

	} catch (error) {
		console.error('Error showing members:', error);
		await interaction.reply({
			content: strings.error,
			ephemeral: true
		});
	}
}
