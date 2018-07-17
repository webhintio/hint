import { statSync } from 'fs';

/** Check if a path exists */
export default (pathString: string): boolean => {
    try {
        const stats = statSync(pathString);

        return stats.isDirectory();
    } catch (e) {
        return false;
    }
};
