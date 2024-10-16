import { StudySession } from "../../models/StudySession";

export async function schedule_session({
	interaction
}: any) {
	const topic = interaction.options.getString('topic')!;
	const time = interaction.options.getString('time')!;
	const date = interaction.options.getString('date')!;

	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	const timeRegex = /^\d{2}:\d{2}$/;

	if (!dateRegex.test(date)) {
		await interaction.reply('Invalid date format! Please use YYYY-MM-DD.');
		return;
	}

	if (!timeRegex.test(time)) {
		await interaction.reply('Invalid time format! Please use HH:MM.');
		return;
	}

	const studyTime = new Date(`${date}T${time}:00Z`);

	if (isNaN(studyTime.getTime())) {
		await interaction.reply('Invalid date or time. Please check your input.');
		return;
	}

	const currentTime = new Date();
	
	if (studyTime <= currentTime) {
		await interaction.reply('You cannot schedule a session in the past!');
		return;
	}
	try {
		const newSession = new StudySession({
			topic,
			time: studyTime,
		});
		await newSession.save();  // Save the session in MongoDB
		await interaction.reply(`Study session on **${topic}** scheduled for ${studyTime.toUTCString()}`);
		const delay = studyTime.getTime() - currentTime.getTime() - 5 * 60 * 1000; // 5 minutes before
		setTimeout(() => {
			interaction.channel?.send(`Reminder: Study session on **${topic}** starts in 5 minutes!`);
		}, delay);
	} catch (err) {
		console.error('Error saving session:', err);
		await interaction.reply('There was an error scheduling the study session.');
	}
	return;
}