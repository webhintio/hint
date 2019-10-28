import {
    access as _access,
    mkdir as _mkdir
} from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

/* istanbul ignore next */
const access = promisify(_access);

/* istanbul ignore next */
export const mkdir = promisify(_mkdir);

/**
 * Determine if the specified file exists in provided directory
 * (or current directory if none is specified).
 */
/* istanbul ignore next */
export const hasFile = async (name: string, cwd = process.cwd()): Promise<boolean> => {
    try {
        await access(resolve(cwd, name));

        return true;
    } catch (err) {
        return false;
    }
};
