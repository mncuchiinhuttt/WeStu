import 'dotenv/config';
import mongoose from 'mongoose';
import path from 'path';
import { Client } from 'discord.js';
import { CommandKit } from 'commandkit';
import wiktionaryLanguages from './data/wiktionarLanguages.json';

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
        new CommandKit({
            client,
            commandsPath: path.join(__dirname, 'commands'),
            eventsPath: path.join(__dirname, 'events'),
            // validationsPath: path.join(__dirname, 'validations'),
            devGuildIds: ['1266707126831812679'],
            devUserIds: ['936234981167104031', '1021628192215289856'],
            bulkRegister: true,
        });
        client.login(process.env.TOKEN);
    } catch (error) {
        console.log(`Error connecting to MongoDB: ${error}`);
    }
})();