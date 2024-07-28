const getApplicationCommands = async (client: any, guildID: any) => {
	let applicationCommands;
	if(guildID) {
		const guild = await client.guilds.fetch(guildID);
		applicationCommands = guild.commands;
	} else {
		applicationCommands = await client.application.commands;
	}

	await applicationCommands.fetch();
	
	return applicationCommands;
}

export default getApplicationCommands;