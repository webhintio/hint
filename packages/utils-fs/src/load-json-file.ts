import stripComments = require('strip-json-comments');

import { readFile } from './read-file';

/** Loads a JSON a file. */
export const loadJSONFile = (filePath: string) => {
    return JSON.parse(stripComments(readFile(filePath)));
};
