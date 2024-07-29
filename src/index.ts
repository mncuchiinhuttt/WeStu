import 'dotenv/config';
import { 
    Client,
    IntentsBitField
} from 'discord.js';
import eventHandler from './handlers/eventHandler';

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent
    ]
});

eventHandler(client);

client.login(process.env.TOKEN);