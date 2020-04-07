import { readFile as _readFile } from 'fs';

/** Read the contents of the specified file name from the `fixtures` folder. */
export const readFile = (name: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        _readFile(`${__dirname}/../${name}`, 'utf-8', (err, contents) => {
            if (err) {
                reject(err);
            } else {
                resolve(contents);
            }
        });
    });
};
