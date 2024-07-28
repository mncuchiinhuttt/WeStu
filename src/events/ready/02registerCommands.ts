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

const registerCommands = async (client: Client) => {
	try {
		const localCommands = getLocalCommands();
		const applicationCommands = await getApplicationCommands(client, testServerID);
		const channel = client.channels.cache.get('1266707322361610333') as TextChannel;

		for (const localCommand of localCommands) {
			const { name, description, options } = localCommand;
			const existingCommand = applicationCommands.cache.find(
				(cmd: any) => cmd.name === name
			);

			if (existingCommand) {
				if (localCommand.removed) {
					await applicationCommands.delete(existingCommand.id);
					console.log(`🗑️ Removed command ${name}.`);
					channel.send(`🗑️ Removed command ${name}.`);
					continue;
				}

				if (areCommandsDifferent(existingCommand, localCommand)) {
					await applicationCommands.edit(existingCommand.id, {
						description,
						options,
					});

					console.log(`✍🏻 Edited command ${name}.`);
					channel.send(`✍🏻 Edited command ${name}.`);
				}
			} else {
				if (localCommand.removed) {
					console.log(`⏭️ Skipping registering command ${name} as it's set to delete.`);
					channel.send(`⏭️ Skipping registering command ${name} as it's set to delete.`);
					continue;
				}

				await applicationCommands.create({
					name,
					description,
					options,
				});

				console.log(`✅ Registered command ${name}.`);
				channel.send(`✅ Registered command ${name}.`);
			}
		}
	} catch (error) {
		console.log(`There was an error: ${error}`);
	}
};

export default registerCommands;