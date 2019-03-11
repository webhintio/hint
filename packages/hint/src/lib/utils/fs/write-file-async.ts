import { writeFile } from 'fs';
import { promisify } from 'util';

/** Convenience wrapper for asynchronously write a file. */
export const writeFileAsync = async (filePath: string, data: string): Promise<void> => {
    await promisify(writeFile)(filePath, data, { encoding: 'utf8' });
};
