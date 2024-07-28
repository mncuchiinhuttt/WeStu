import path from 'path';
import getAllFiles from './getAllFiles';

interface CommandObject {
    name: string;
    [key: string]: any;
}

const getLocalCommands = (exceptions: string[] = []): CommandObject[] => {
    let localCommands: CommandObject[] = [];

    const commandCategories = getAllFiles(
        path.join(__dirname, '..', 'commands'),
        true
    );

    for (const commandCategory of commandCategories) {
        const commandFiles = getAllFiles(commandCategory);

        for (const commandFile of commandFiles) {
            const commandObject: CommandObject = require(commandFile);

            if (exceptions.includes(commandObject.name)) {
                continue;
            }
            localCommands.push(commandObject);
        }
    }

    return localCommands;
};

export default getLocalCommands;