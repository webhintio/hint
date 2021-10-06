import { readFileSync } from 'fs';

/** Convenience wrapper for synchronously reading file contents. */
export const readFile = (filePath: string): string => {
    const content = readFileSync(filePath, 'utf8');

    if (content[0] === '\uFEFF') {
        return content.substr(1);
    }

    return content;
};
