import { 
    Client, 
    TextChannel 
} from 'discord.js';
import { 
    testServerID 
} from '../../config.json';
import getLocalCommands from '../../utils/getLocalCommands';
import getApplicationCommands from '../../utils/getApplicationCommands';
import areCommandsDifferent from '../../utils/commandDifferentChecker';

module.exports = async (client: Client) => {
	try {
		const localCommands = getLocalCommands();
		const applicationCommands = await getApplicationCommands(client, testServerID);

		for (const localCommand of localCommands) {
			const { name, description, options } = localCommand;
			const existingCommand = applicationCommands.cache.find(
				(cmd: any) => cmd.name === name
			);

			if (existingCommand) {
				if (localCommand.removed) {
					await applicationCommands.delete(existingCommand.id);
					console.log(`🗑️ Removed command ${name}.`);
					continue;
				}

				if (areCommandsDifferent(existingCommand, localCommand)) {
					await applicationCommands.edit(existingCommand.id, {
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

				console.log(`✅ Registered command ${name}.`);
			}
		}
	} catch (error) {
		console.log(`There was an error ${error}`);
	}
};

// export default registerCommands;