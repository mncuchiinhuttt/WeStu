import { 
    Client, 
    ActivityType 
} from 'discord.js';

module.exports = (client: Client) => {
    console.log(`${client.user?.tag} is online now.`);

    // Set Activity
    client.user?.setActivity({
        name: '🌷 WeStu 🌷',
        type: ActivityType.Playing,
    });

    // Get Date
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Send log to console
    console.log(`Started time: ${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()} ${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()} (UTC+7)`);
};