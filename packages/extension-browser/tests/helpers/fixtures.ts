import { readFile } from 'fs';

/** Read the contents of the specified file name from the `fixtures` folder. */
export const readFixture = (name: string): Promise<string> => new Promise((resolve, reject) => {
    readFile(`${__dirname}/../fixtures/${name}`, 'utf-8', (err, contents) => {
        if (err) {
            reject(err);
        } else {
            resolve(contents);
        }
    });
});
