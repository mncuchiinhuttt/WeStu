import { ActivityType, Client } from 'discord.js';
import 'dotenv/config';

const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent']
});

client.on('ready', () => {
    console.log(`${process.env.BOT_NAME} is ready!\n`);
    client.user?.setActivity({
        name: 'FUCK YOUR MOM',
        type: ActivityType.Listening
    });
});

client.login(process.env.TOKEN);