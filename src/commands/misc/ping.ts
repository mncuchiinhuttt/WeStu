import { 
    Client, 
    CommandInteraction 
} from 'discord.js';

export default {
    name: 'ping',
    description: 'Pong!',
    // removed: true
    // devOnly: true,
    // testOnly: true,
    options: [],
    // permissionsRequired: [],
    // botPermissions: [],

    callback: (client: Client, interaction: CommandInteraction) => {
        interaction.reply(`Pong! ${client.ws.ping}ms.`);
    },
};