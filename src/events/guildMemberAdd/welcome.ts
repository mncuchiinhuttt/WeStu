import { GuildMember, EmbedBuilder } from 'discord.js';

export default async function (member: GuildMember) {
	try {
		const welcomeEmbed = new EmbedBuilder()
			.setTitle('🌸 Welcome to the Server! 🌸')
			.setDescription(`Welcome <@${member.id}>! We're glad you're here!`)
			.setColor('#FFB6C1')
			.setThumbnail(member.user.displayAvatarURL())
			.setTimestamp();

		const welcomeChannel = member.guild.channels.cache.get('1310995374583971941');
		const logChannel = member.guild.channels.cache.get('1310945361426255972');

		if (welcomeChannel?.isTextBased() && logChannel?.isTextBased()) {
			await welcomeChannel.send({ embeds: [welcomeEmbed] });
			await logChannel.send(`Member joined: ${member.user.tag} at ${new Date().toLocaleString()}`);
		}

		const dmEmbed = new EmbedBuilder()
			.setTitle('👋 Welcome to WeStu!')
			.setDescription('I\'m your study companion bot! Here are some things I can help you with:')
			.setColor('#87CEEB')
			.addFields(
				{ name: '📚 Study Sessions', value: 'Track your study time with `/study session`' },
				{ name: '✅ Task Management', value: 'Manage your tasks with `/todo`' },
				{ name: '🎯 Study Target', value: 'Set and track goals with `/study target`' },
				{ name: '📝 Study Resources', value: 'Share and access resources with `/study resources`' },
				{ name: '📅 Study Schedule', value: 'Plan your study schedule with `/study schedule`' },
				{ name: '📊 Study Stats', value: 'View your study stats with `/study stats`' },
				{ name: '🔔 Reminders', value: 'Remind your tasks and schedule' },
			)
			.setFooter({ text: 'Type any command to get started!' });

		await member.send({ embeds: [dmEmbed] });

	} catch (error) {
		console.error('Error sending welcome messages:', error);
	}
}