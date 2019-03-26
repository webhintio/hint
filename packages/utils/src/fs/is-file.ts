import { statSync } from 'fs';

/** Check if a path is a file and exists. */
export const isFile = (filePath?: string): boolean => {
    try {
        const stats = statSync(filePath!);

        return stats.isFile();
    } catch (e) {
        return false;
    }
};
