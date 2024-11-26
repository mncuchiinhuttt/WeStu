import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

async function run({ interaction }: any) {
	const question = interaction.options.getString('question');
	const options = interaction.options.getString('options').split(',').map((opt: any) => opt.trim());

	if (options.length < 2 || options.length > 10) {
		await interaction.reply('Please provide 2-10 options separated by commas');
		return;
	}

	const reactions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
	
	const embed = new EmbedBuilder()
		.setTitle('📊 Poll: ' + question)
		.setDescription(
			options.map((opt: any, i: any) => `${reactions[i]} ${opt}`).join('\n\n')
		)
		.setColor('#00FFFF');

	const poll = await interaction.reply({ embeds: [embed], fetchReply: true });
	
	for (let i = 0; i < options.length; i++) {
		await poll.react(reactions[i]);
	}
}

const data = new SlashCommandBuilder()
	.setName('quickpoll')
	.setDescription('Create a quick poll')
	.setDescriptionLocalizations({
		'vi': 'Tạo một bình chọn nhanh'
	})
	.addStringOption(option => 
		option
		.setName('question')
		.setDescription('The poll question')
		.setDescriptionLocalizations({
			'vi': 'Câu hỏi'
		})
		.setRequired(true)
	)
	.addStringOption(option =>
		option
		.setName('options')
		.setDescription('Poll options (comma-separated)')
		.setDescriptionLocalizations({
			'vi': 'Các lựa cho (phân cách bằng dấu phẩy)'
		})
		.setRequired(true)
	);

const options = {
	devOnly: false,
}

export {
	run,
	data,
	options
}