import messageArray from "../../data/message_array";
import axios from 'axios';

export function mathjs_evaluate({
	interaction
}: any) {
	const expression = interaction.options.getString('expression');
	const precision = interaction.options.getNumber('precision');
	const encodedExpression = encodeURIComponent(expression);
	const url = precision !== null
		? `http://api.mathjs.org/v4/?expr=${encodedExpression}&precision=${precision}`
		: `http://api.mathjs.org/v4/?expr=${encodedExpression}`;

	axios.get(url)
		.then(response => {
			const result = String(response.data);
			const fullReply = `> ${expression}\n The result is ${result}.`;
			if (fullReply.length > 1900) { interaction.reply(result); }
			interaction.reply(fullReply);
		})
		.catch(error => {
			interaction.reply('Error evaluating expression.');
		}
		);
}