import path from 'path';
import getAllFiles from '../utils/getAllFiles';

const eventHandler = (client: any) => {
    const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

    for (const eventFolder of eventFolders) {
        const eventFiles = getAllFiles(eventFolder);
        eventFiles.sort((a: string, b: string) => a.localeCompare(b));

        const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

        client.on(eventName, async (arg: any) => {
            for (const eventFile of eventFiles) {
                const eventFunction = require(eventFile);

                if (typeof eventFunction === 'function') {
                    await eventFunction(client, arg);
                } else {
                    console.error(`The module at ${eventFile} does not export a function.`);
                }
            }
        });
    }
};

export default eventHandler;