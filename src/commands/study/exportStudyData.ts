import { CommandInteraction, AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { TimeStudySession } from '../../models/TimeStudySessionModel';
import { createReadStream, writeFileSync } from 'fs';
import { join } from 'path';
import { generatePDFReport } from '../../utils/generatePDFReport';
import { generateCalendarFile } from '../../utils/generateCalendarFile';
import { tmpdir } from 'os';
import { LanguageService } from '../../utils/LanguageService';

let strings: any;

export async function exportStudyData(interaction: any) {
	const format = interaction.options.getString('format', true);
	const userId = interaction.user.id;

	const languageService = LanguageService.getInstance();
	const userLang = await languageService.getUserLanguage(interaction.user.id);
	const langStrings = require(`../../data/languages/${userLang}.json`);
	strings = langStrings.commands.study.exportStudyData;

	try {
		const sessions = await TimeStudySession.find({ userId }).sort({ beginTime: 1 });

		if (sessions.length === 0) {
			const embed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle(strings.title)
				.setDescription(strings.notFound);

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
			return;
		}

		switch (format) {
			case 'csv':
				await exportAsCSV(interaction, sessions);
				break;
			case 'pdf':
				await exportAsPDF(interaction, sessions);
				break;
			case 'calendar':
				await exportAsCalendar(interaction, sessions);
				break;
			default:
				const embed = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle(strings.title)
					.setDescription(strings.invalidformat);

				await interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
				break;
		}
	} catch (error) {
		console.error('Error exporting study data:', error);
		const embed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle(strings.title)
			.setDescription(strings.error);

		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	}
}

async function exportAsCSV(interaction: CommandInteraction, sessions: any[]) {
	const csvHeaders = 'Session ID,Start Time,End Time,Duration (seconds)';
	const csvRows = sessions.map(session => {
		const startTime = session.beginTime instanceof Date ? session.beginTime.toISOString() : 'N/A';
		const endTime = session.finishTime instanceof Date ? session.finishTime.toISOString() : 'In Progress';
		const duration = session.duration || 0;
		return `${session._id},${startTime},${endTime},${duration}`;
	});

	const csvContent = [csvHeaders, ...csvRows].join('\n');
	const buffer = Buffer.from(csvContent, 'utf-8');

	const attachment = new AttachmentBuilder(buffer, { name: `study_data_${interaction.user.id}.csv` });

	const embed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle(strings.title)
		.setDescription(strings.csv);

	await interaction.reply({
		embeds: [embed],
		files: [attachment],
		ephemeral: true,
	});
}

async function exportAsPDF(interaction: any, sessions: any[]) {
	const pdfBuffer = await generatePDFReport(interaction.user.username, sessions);
	const attachment = new AttachmentBuilder(pdfBuffer, { name: `study_report_${interaction.user.id}.pdf` });

	const embed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle(strings.title)
		.setDescription(strings.pdf);

	await interaction.reply({
		embeds: [embed],
		files: [attachment],
		ephemeral: true,
	});
}

async function exportAsCalendar(interaction: CommandInteraction, sessions: any[]) {
	const calendarContent = generateCalendarFile(sessions);
	const buffer = Buffer.from(calendarContent, 'utf-8');

	const attachment = new AttachmentBuilder(buffer, { name: `study_calendar_${interaction.user.id}.ics` });

	const embed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle(strings.title)
		.setDescription(strings.calendar);

	await interaction.reply({
		embeds: [embed],
		files: [attachment],
		ephemeral: true,
	});
}