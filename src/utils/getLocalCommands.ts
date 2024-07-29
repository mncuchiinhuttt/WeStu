import path from 'path';
import getAllFiles from './getAllFiles';

const getLocalCommands = (exceptions: string[] = []) => {
	let localCommands = [];

	const commandCatagories = getAllFiles(
		path.join(__dirname, '..', 'commands'),
		true
	);

	for (const commandCatagory of commandCatagories) {
		const commandFiles = getAllFiles(commandCatagory);
		
		for (const commandFile of commandFiles) {
			const commandObject = require(commandFile);

			if(exceptions.includes(commandObject.name)) {
				continue;
			}
			localCommands.push(commandObject);
		}
	}

	return localCommands;
}

export default getLocalCommands;