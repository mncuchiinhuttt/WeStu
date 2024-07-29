import 'dotenv/config';
import eventHandler from './handlers/eventHandler';
import { 
    Client 
} from 'discord.js';

const client = new Client({
    intents: [
        'Guilds', 
        'GuildMessages', 
        'GuildMembers', 
        'MessageContent'
    ],
});

eventHandler(client);

client.login(process.env.TOKEN);