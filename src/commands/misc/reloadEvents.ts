import { 
    CommandData, 
    SlashCommandProps, 
    CommandOptions 
} from 'commandkit';

export const data: CommandData = {
    name: 'reloadevents',
    description: 'Reload all events',
}

export function run({
    interaction, 
    handler,
}: SlashCommandProps) {
    handler.reloadEvents();
    interaction.reply(`All events has been reloaded!`);
}

export const options: CommandOptions = {
    devOnly: true,
    testOnly: false,
}