import { promisify } from 'util';
import { readFile } from 'fs';

import stripBom = require('strip-bom'); // `require` used because `strip-bom` exports a function

/** Convenience wrapper for asynchronously reading file contents. */
export default async (filePath: string): Promise<string> => {
    const content: string = await promisify(readFile)(filePath, 'utf8');

    return stripBom(content);
};
