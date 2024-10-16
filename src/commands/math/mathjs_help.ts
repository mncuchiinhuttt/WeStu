import messageArray from '../../data/message_array';
import { commonMathFunctions } from '../../data/commonMathFunctions';

export function mathjs_help({
	interaction
}: any) {
	const message = new messageArray();
	message.push(`# Math.js Help\n`);
	for (const func of commonMathFunctions) {
		message.push(`**${func.name}** - \`${func.function}\``);
	}
	message.push(`\nTo use a function, type \`mathjs evaluate\` followed by the function and the number you want to evaluate. For example, to find the square root of 4, type \`mathjs evaluate sqrt(4)\``);
	interaction.reply(message.get(0));
	return;
}