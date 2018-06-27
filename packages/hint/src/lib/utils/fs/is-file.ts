import { test } from 'shelljs';

/** Check if a path is a file and exists. */
export default (filePath: string): boolean => {
    return test('-f', filePath);
};
