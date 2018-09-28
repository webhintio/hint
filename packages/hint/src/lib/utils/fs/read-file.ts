import { readFileSync } from 'fs';

import stripBom = require('strip-bom'); // `require` used because `strip-bom` exports a function

/** Convenience wrapper for synchronously reading file contents. */
export default (filePath: string): string => {
    return stripBom(readFileSync(filePath, 'utf8'));
};
