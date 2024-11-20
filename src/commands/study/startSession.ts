import { TimeStudySession } from "../../models/TimeStudySession";
import { CommandInteraction } from "discord.js";

export async function start_session({ interaction }: { interaction: CommandInteraction }) {
	try {
		const userId = interaction.user.id;

		const existingSession = await TimeStudySession.findOne({
				userId: userId,
				finishTime: { $exists: false },
				duration: { $exists: false }
		});

		if (existingSession) {
				await interaction.reply({
						content: "You already have an active study session! Please finish it first.",
						ephemeral: true
				});
				return;
		}

		const newSession = new TimeStudySession({
				userId: userId,
				beginTime: new Date()
		});

		await newSession.save();

		await interaction.reply({
				content: "Study session started! Use `/study finish-session` when you're done.",
				ephemeral: true
		});

	} catch (error) {
		console.error('Error in start_session: ', error);
		interaction.reply({
			content: 'Failed to start study session. Please try again.',
			ephemeral: true
		});
	}
}