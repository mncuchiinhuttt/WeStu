import 'dotenv/config'
import { Client, ActivityType } from 'discord.js';

const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'GuildMembers', 'MessageContent']
});

client.on('ready', () => {
    console.log(`${process.env.BOT_NAME} is ready!\n`);
    client.user?.setActivity({
        name: 'YOUR MOM',
        type: ActivityType.Playing
    });
});

client.login(process.env.TOKEN);