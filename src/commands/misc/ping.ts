import { 
    CommandData, 
    SlashCommandProps, 
    CommandOptions 
} from 'commandkit';

export const data: CommandData = {
    name: 'ping',
    description: 'Pong!',
}

export function run({
    interaction, 
    client, 
    handler,
}: SlashCommandProps) {
    interaction.reply(`Pong! ${client.ws.ping}ms.`);
}

export const options: CommandOptions = {
    devOnly: false,
    testOnly: false,
}	