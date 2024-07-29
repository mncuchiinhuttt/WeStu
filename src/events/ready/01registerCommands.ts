import { 
	testServerID 
} from '../../config.json';
import {
	getLocalCommands
} from '../../utils/getLocalCommands';
import commandDifferentChecker from '../../utils/commandDifferentChecker';
import getApplicationCommands from '../../utils/getApplicationCommands';

module.exports = async (client: any) => {
	try {
		const localCommands = getLocalCommands();
		const applicationCommands = await getApplicationCommands(client, testServerID);

		for (const localCommand of localCommands) {
			const { name, description, options } = localCommand;
			const existingCommand = await applicationCommands.cache.find(
				(cmd: any) => cmd.name === name
			);

			if (existingCommand) {
				if (localCommand.removed) {
					await applicationCommands.delete(existingCommand.id);
					console.log(`🗑️ Removed command ${name}.`);
					continue;
				}

				if (commandDifferentChecker(existingCommand, localCommand)) {
					await applicationCommands.edit(
						existingCommand.id, {
							description,
							options,
					});

					console.log(`✍🏻 Edited command ${name}.`);
				}
			} else {
				if (localCommand.removed) {
					console.log(`⏭️ Skipping registering command ${name} as it's set to delete.`);
					continue;
				}
				
				await applicationCommands.create({
					name,
					description,
					options,
				});

				console.log(`✅ Registed command ${name}.`);
			}
		}
	} catch (error) {
		console.log(`There was an error: ${error}`);
	}
};