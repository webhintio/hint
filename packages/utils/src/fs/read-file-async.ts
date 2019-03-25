import { promisify } from 'util';
import { readFile } from 'fs';

import stripBom = require('strip-bom'); // `require` used because `strip-bom` exports a function

declare const __webpack_require__: Function; // eslint-disable-line

/** Convenience wrapper for asynchronously reading file contents. */
export const readFileAsync = async (filePath: string): Promise<string> => {
    if (typeof __webpack_require__ !== 'undefined' && typeof filePath === 'number') { // eslint-disable-line
        // Read files from a webpack bundle (must have been bundled using webpack's `raw-loader`).
        return __webpack_require__(filePath).default;
    }

    const content: string = await promisify(readFile)(filePath, 'utf8');

    return stripBom(content);
};
