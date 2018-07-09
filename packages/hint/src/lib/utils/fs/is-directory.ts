import { statSync } from 'fs';

/** Check if a path is a directory and exists*/
export default (directoryPath: string): boolean => {
    try {
        const stat = statSync(directoryPath);

        return stat.isDirectory();
    } catch (e) {
        return false;
    }
};
