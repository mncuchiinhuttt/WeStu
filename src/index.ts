import 'dotenv/config';
import { 
    ActivityType, 
    Client 
} from 'discord.js';
import eventHandler from './handlers/eventHandler';

const client = new Client({
    intents: [
        'Guilds', 
        'GuildMessages', 
        'GuildMembers', 
        'MessageContent'
    ]
});

eventHandler(client);

client.login(process.env.TOKEN);