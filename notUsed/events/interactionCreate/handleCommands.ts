import { 
    testServerID, 
    developers 
} from '../../config.json';
import {
	getLocalCommands
} from '../../utils/getLocalCommands';

module.exports = async (client: any, interaction: any) => {
	if(!interaction.isChatInputCommand()) 
		return;

		const localCommands = getLocalCommands();

		try {
			const commandObject = localCommands.find(
				(cmd: any) => cmd.name === interaction.commandName
			);

			if (!commandObject)
				return;

			if (commandObject.devOnly) {
				if (!developers.includes(interaction.member.id)) {
					interaction.reply({
						content: 'Only devlopers are allowed to use this command.',
						ephemeral: true,
					});
					return;
				}
			}

			if (commandObject.testOnly) {
				if (!(interaction.guild.id === testServerID)) {
					interaction.reply({
						content: 'This command can only run in test server.',
						ephemeral: true,
					});
					return;
				}
			}

			if (commandObject.permissionRequired?.length) {
				for (const permisson of commandObject.permissionRequired) {
					if (!interaction.member.permission.has(permisson)) {
						interaction.reply({
							content: `You don't have enough permissons to run this command.`,
							ephemeral: true,
						});
						break;
					}
				}
			}
			
			if (commandObject.botPermisson?.length) {
				for (const permission of commandObject.botPermisson) {
					const bot = interaction.guild.members.me;

					if (!bot.permissions.has(permission)) {
						interaction.reply({
							content: `Oh shit! I don't have enough permissions to run this command.`,
							ephemeral: true,
						});
						break;
					}
				}
			}

			await commandObject.callback(client, interaction);
		} catch (error) {
			console.log(`There was an error running this command: ${error}.`);
		}
};