import { test } from 'shelljs';

/** Check if a path is a directory and exists*/
export default (directoryPath: string): boolean => {
    return test('-d', directoryPath);
};
