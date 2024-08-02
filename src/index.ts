import 'dotenv/config';
import eventHandler from './handlers/eventHandler';
import mongoose from 'mongoose';
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

(async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.DATABASE_URI as string);
        console.log(`Connected to MongoDB`);
        eventHandler(client);
    } catch (error) {
        console.log(`Error connecting to MongoDB: ${error}`);
    }
})();


client.login(process.env.TOKEN);