import * as stripComments from 'strip-json-comments';

import readFileAsync from './read-file-async';

/** Loads a JSON a file. */
export default async (filePath: string) => {
    /*
     * Webpack will return the json file as an object, so
     * we need to check tye type of what we are receiving.
     */
    const fileContent = await readFileAsync(filePath);

    if (typeof fileContent === 'string') {
        return JSON.parse(stripComments(fileContent));
    }

    return fileContent;
};
