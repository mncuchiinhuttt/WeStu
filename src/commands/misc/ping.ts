module.exports = {
    name: 'ping',
    description: 'Pong!',
    options: [],
    // removed: true
    // devOnly: true,
    // testOnly: true,
    // permissionsRequired: [],
    // botPermissions: [],

    callback: (client: any, interaction: any) => {
        interaction.reply(`Pong! ${client.ws.ping}ms.`);
    },
};