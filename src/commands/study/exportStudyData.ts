import { CommandInteraction, AttachmentBuilder } from 'discord.js';
import { TimeStudySession } from '../../models/TimeStudySession';
import { createReadStream, writeFileSync } from 'fs';
import { join } from 'path';
import { generatePDFReport } from '../../utils/generatePDFReport';
import { generateCalendarFile } from '../../utils/generateCalendarFile';
import { tmpdir } from 'os';

export async function exportStudyData(interaction: any) {
	const format = interaction.options.getString('format', true);
	const userId = interaction.user.id;

	try {
		// Fetch user's study sessions
		const sessions = await TimeStudySession.find({ userId }).sort({ beginTime: 1 });

		if (sessions.length === 0) {
			await interaction.reply({
				content: 'No study data found to export.',
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
				await interaction.reply({
					content: 'Invalid format selected.',
					ephemeral: true,
				});
				break;
		}
	} catch (error) {
		console.error('Error exporting study data:', error);
		await interaction.reply({
			content: 'Failed to export study data. Please try again.',
			ephemeral: true,
		});
	}
}

async function exportAsCSV(interaction: CommandInteraction, sessions: any[]) {
  const csvHeaders = 'Session ID,Start Time,End Time,Duration (seconds)';
  const csvRows = sessions.map(session => {
    const startTime = session.beginTime.toISOString();
    const endTime = session.finishTime ? session.finishTime.toISOString() : 'In Progress';
    const duration = session.duration || 0;
    return `${session._id},${startTime},${endTime},${duration}`;
  });

  const csvContent = [csvHeaders, ...csvRows].join('\n');
  const buffer = Buffer.from(csvContent, 'utf-8');

  const attachment = new AttachmentBuilder(buffer, { name: `study_data_${interaction.user.id}.csv` });

  await interaction.reply({
    content: '📁 Here is your exported study data in CSV format.',
    files: [attachment],
    ephemeral: true,
  });
}

async function exportAsPDF(interaction: any, sessions: any[]) {
	const pdfBuffer = await generatePDFReport(interaction.user.username, sessions);
	const attachment = new AttachmentBuilder(pdfBuffer, { name: `study_report_${interaction.user.id}.pdf` });

	await interaction.reply({
		content: '📄 Here is your study report in PDF format.',
		files: [attachment],
		ephemeral: true,
	});
}

async function exportAsCalendar(interaction: CommandInteraction, sessions: any[]) {
  const calendarContent = generateCalendarFile(sessions);
  const buffer = Buffer.from(calendarContent, 'utf-8');

  const attachment = new AttachmentBuilder(buffer, { name: `study_calendar_${interaction.user.id}.ics` });

  await interaction.reply({
    content: '📅 Here is your study calendar file.',
    files: [attachment],
    ephemeral: true,
  });
}