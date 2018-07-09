import * as readline from 'readline';

/** Asks a y/n question to the user defaulting to Yes. */
export default (question: string): Promise<boolean> => {
    return new Promise((resolve) => {

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${question} (Y/n)`, (value) => {
            rl.close();

            if (!value || value.toLowerCase() === 'y') {
                return resolve(true);
            }

            return resolve(false);
        });
    });
};
