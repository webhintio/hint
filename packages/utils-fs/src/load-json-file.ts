import stripComments = require('strip-json-comments');

import { readFile } from './read-file';
import { parseJSON } from '@hint/utils-json';

/** Loads a JSON a file. */
export const loadJSONFile = (filePath: string) => {
    return parseJSON(stripComments(readFile(filePath))).data;
};
