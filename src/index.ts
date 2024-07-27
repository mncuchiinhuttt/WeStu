import 'dotenv/config'
import { Client, ActivityType } from 'discord.js';

const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent']
});

client.on('ready', () => {
    console.log('Bot is ready');
    client.user?.setActivity({
        name: 'FUCK YOUR MOM',
        type: ActivityType.Listening
    });
});

client.login(process.env.TOKEN);