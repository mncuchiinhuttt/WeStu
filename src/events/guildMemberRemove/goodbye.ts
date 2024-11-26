import { GuildMember, EmbedBuilder } from 'discord.js';

export default async function (member: GuildMember) {
	try {
		// Create goodbye embed
		const goodbyeEmbed = new EmbedBuilder()
			.setTitle('👋 Farewell!')
			.setDescription(`**${member.user.username}** has left the server. We hope to see you again!`)
			.setColor('#FFB6C1')
			.setThumbnail(member.user.displayAvatarURL())
			.setTimestamp();

		const goodbyeChannel = member.guild.channels.cache.get('1310995374583971941');
		const logChannel = member.guild.channels.cache.get('1310945361426255972');
		
		if (goodbyeChannel?.isTextBased() && logChannel?.isTextBased()) {
			await goodbyeChannel.send({ embeds: [goodbyeEmbed] });
			await logChannel.send(`Member left: ${member.user.tag} at ${new Date().toLocaleString()}`);
		}
	} catch (error) {
		console.error('Error sending goodbye message:', error);
	}
}