import messageArray from "../../data/message_array";
import { studyHelpData } from "../../data/study_help_data";

export function study_help ( { interaction }: any ) {
  const message = new messageArray();

	message.push("# Study help\n");
	message.push(`There are several ways to study with this bot. Good luck with your studies! Stay focused and keep pushing forward.\n`);
	for (const data of studyHelpData) {
		message.push(`## ${data.name}\n`);
		message.push(`- ${data.description}\n`);
		if (data.options) {
			message.push("### Options\n");
			for (const [key, value] of Object.entries(data.options)) {
				message.push(`- **${key}:** ${value}\n`);
			}
		}
	}
	interaction.reply(message.get(0));
  return;
}