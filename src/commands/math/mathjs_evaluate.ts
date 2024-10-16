import messageArray from "../../data/message_array";
import axios from 'axios';

export function mathjs_evaluate({
	interaction
}: any) {
	const expression = interaction.options.getString('expression');
	const precision = interaction.options.getNumber('precision');
	const message = new messageArray();
	const encodedExpression = encodeURIComponent(expression);
	const url = precision !== null 
		? `http://api.mathjs.org/v4/?expr=${encodedExpression}&precision=${precision}`
		: `http://api.mathjs.org/v4/?expr=${encodedExpression}`;

	axios.get(url)
		.then(response => {
			message.push(response.data);
			interaction.reply(message.toString());
		})
		.catch(error => {
			message.push('Error evaluating expression.');
			interaction.reply(message.toString());
		});
}