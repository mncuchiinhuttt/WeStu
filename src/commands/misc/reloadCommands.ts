import { 
    CommandData, 
    SlashCommandProps, 
    CommandOptions 
} from 'commandkit';

export const data: CommandData = {
    name: 'reloadcommands',
    description: 'Reload all commands',
}

export function run({
    interaction, 
    client, 
    handler,
}: SlashCommandProps) {
    handler.reloadCommands();
    interaction.reply(`All commands has been reloaded!`);
}

export const options: CommandOptions = {
    devOnly: true,
    testOnly: false,
}