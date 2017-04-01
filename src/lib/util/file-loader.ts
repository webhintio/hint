import * as d from 'debug';
const debug = d('sonar:util:file-loader');

import * as stripComments from 'strip-json-comments';
import * as requireUncached from 'require-uncached';

import { readFile } from './misc';

/** Loads a JSON a file. */
const loadJSONFile = (filePath: string): any => {

    debug(`Loading JSON file: ${filePath}`);

    return JSON.parse(stripComments(readFile(filePath)));
};

/** Loads a JavaScript file. */
const loadJSFile = (filePath: string): any => {

    debug(`Loading JS file: ${filePath}`);

    return requireUncached(filePath);
};

export {
    loadJSFile,
    loadJSONFile
};
