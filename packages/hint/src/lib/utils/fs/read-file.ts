import { readFileSync } from 'fs';

import * as stripBom from 'strip-bom';

/** Convenience wrapper for synchronously reading file contents. */
export default (filePath: string): string => {
    return stripBom(readFileSync(filePath, 'utf8'));
};
