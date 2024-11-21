import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { StudyResource } from '../../models/StudyResource';

export async function manageResources(interaction: any) {
	const action = interaction.options.getString('action', true);

	switch (action) {
		case 'add':
			await addResource(interaction);
			break;
		case 'view':
			await viewResources(interaction);
			break;
		case 'delete':
			await deleteResource(interaction);
			break;
		default:
			await interaction.reply({
				content: 'Invalid action',
				ephemeral: true,
			});
			break;
	}
}

async function addResource(interaction: any) {
	const title = interaction.options.getString('title');
	const description = interaction.options.getString('description');
	const link = interaction.options.getString('link');
	const share = interaction.options.getBoolean('share') || false;

	if (!title || (!description && !link)) {
		await interaction.reply({
			content: 'You must provide at least a title and a description or link.',
			ephemeral: true
		});
		return;
	}

	try {
		const newResource = await StudyResource.create({
			userId: interaction.user.id,
			title: `${share ? '🌐' : '🔒'} ${title}`,
			description,
			link,
			shareWithServer: share,
			createdAt: new Date()
		});

		await interaction.reply({
			content: `✅ Resource "${title}" added successfully.\n**Description:** ${description || 'No description provided.'}\n**Link:** ${link || 'No link provided.'}\n**Shared with server:** ${share ? 'Yes' : 'No'}`,
			ephemeral: !share
		});
	} catch (error) {
		console.error('Error adding resource:', error);
		await interaction.reply({
			content: 'Failed to add resource. Please try again.',
			ephemeral: true
		});
	}
}

async function viewResources(interaction: CommandInteraction) {
	try {
		const resources = await StudyResource.find({
			$or: [{ userId: interaction.user.id }, { shareWithServer: true }],
		}).sort({ createdAt: -1 });

		if (resources.length === 0) {
			await interaction.reply({
				content: 'No resources found.',
				ephemeral: true,
			});
			return;
		}

		const resourcesPerPage = 10;
		const totalPages = Math.ceil(resources.length / resourcesPerPage);
		let currentPage = 0;

		const generateEmbed = (page: number) => {
			const embed = new EmbedBuilder()
				.setTitle('📚 Study Resources')
				.setColor('#00ff00')
				.setFooter({ text: `Page ${page + 1} of ${totalPages}` });

			const start = page * resourcesPerPage;
			const end = start + resourcesPerPage;
			const pageResources = resources.slice(start, end);

			pageResources.forEach((resource) => {
				const visibilityEmoji = resource.shareWithServer ? '🌐' : '🔒';
				embed.addFields({
					name: `${visibilityEmoji} ${resource.title} (ID: ${resource._id})`,
					value: `${resource.description || ''}\n${resource.link || ''}\nShared by: <@${resource.userId}>`,
				});
			});

			return embed;
		};

		const embedMessage = await interaction.reply({
			embeds: [generateEmbed(currentPage)],
			ephemeral: false,
			fetchReply: true,
		});

		if (totalPages > 1) {
			await embedMessage.react('⬅️');
			await embedMessage.react('➡️');

			const filter = (reaction: any, user: any) =>
				['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === interaction.user.id;
			const collector = embedMessage.createReactionCollector({ filter, time: 60000 });

			collector.on('collect', async (reaction: any) => {
				if (reaction.emoji.name === '⬅️' && currentPage > 0) {
					currentPage--;
				} else if (reaction.emoji.name === '➡️' && currentPage < totalPages - 1) {
					currentPage++;
				}

				await embedMessage.edit({ embeds: [generateEmbed(currentPage)] });
				await reaction.users.remove(interaction.user.id);
			});
		}
	} catch (error) {
		console.error('Error viewing resources:', error);
		await interaction.reply({
			content: 'Failed to retrieve resources. Please try again.',
			ephemeral: true,
		});
	}
}

async function deleteResource(interaction: any) {
	const resourceId = interaction.options.getString('resource_id');

	if (!resourceId) {
		await interaction.reply({
			content: 'You must provide the resource ID to delete.',
			ephemeral: true,
		});
		return;
	}

	try {
		const resource = await StudyResource.findOne({
			_id: resourceId,
			userId: interaction.user.id,
		});

		if (!resource) {
			await interaction.reply({
				content: 'Resource not found or you do not have permission to delete it.',
				ephemeral: true,
			});
			return;
		}

		await StudyResource.deleteOne({ _id: resourceId });

		await interaction.reply({
			content: `✅ Resource "${resource.title}" has been deleted.`,
			ephemeral: true,
		});
	} catch (error) {
		console.error('Error deleting resource:', error);
		await interaction.reply({
			content: 'Failed to delete resource. Please try again.',
			ephemeral: true,
		});
	}
}