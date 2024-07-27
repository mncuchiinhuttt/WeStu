import 'dotenv/config';
import { ActivityType, Client } from 'discord.js';
import { eventHandler } from './handlers/eventHandler';

const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent']
});

eventHandler(client);

client.on('ready', () => {
    console.log(`${process.env.BOT_NAME} is ready!\n`);
    client.user?.setActivity({
        name: 'WeStu Discord Chatbot',
        type: ActivityType.Playing
    });
});

client.login(process.env.TOKEN);