import stripComments = require('strip-json-comments');
import { parse } from 'jsonc-parser';
import { readFile } from './read-file';

/** Loads a JSON a file. */
export const loadJSONFile = (filePath: string) => {
    return parse(stripComments(readFile(filePath)));
};
