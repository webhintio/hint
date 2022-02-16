import { parse, parseTree } from 'jsonc-parser';
import { readFile } from './read-file';

/** Loads a JSON a file. */
export const loadJSONFile = (filePath: string) => {
    const jsonStr = readFile(filePath);
    const data = parse(jsonStr);
    const root = parseTree(jsonStr);

    // If we didn't get a root, it's invalid JSON. If there are no children, its also likely invalid JSON.
    if (!root || !root.children || root.children.length === 0) {
        // Use the built-in JSON parser to throw an error
        JSON.parse(jsonStr);
    }

    return data;
};
