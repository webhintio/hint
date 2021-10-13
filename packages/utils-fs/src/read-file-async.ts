import { promisify } from 'util';
import { readFile } from 'fs';

declare const __webpack_require__: Function; // eslint-disable-line

/** Convenience wrapper for asynchronously reading file contents. */
export const readFileAsync = async (filePath: string): Promise<string> => {
    /* istanbul ignore next */
    if (typeof __webpack_require__ !== 'undefined' && typeof filePath === 'number') { // eslint-disable-line
        // Read files from a webpack bundle (must have been bundled using webpack's `raw-loader`).
        return __webpack_require__(filePath);
    }

    const content: string = await promisify(readFile)(filePath, 'utf8');

    if (content[0] === '\uFEFF') {
        return content.substr(1);
    }

    return content;
};
