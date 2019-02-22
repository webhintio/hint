import * as stripComments from 'strip-json-comments';

import readFile from './read-file';

/** Loads a JSON a file. */
export default (filePath: string) => JSON.parse(stripComments(readFile(filePath)));
