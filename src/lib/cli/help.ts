import { options } from './options';
import * as logger from '../utils/logging';

/** Prints the help menu in the console. */
export const printHelp = (): Promise<boolean> => {
    // `help` is the last resort, no need to verify if it is an option
    logger.log(options.generateHelp());

    return Promise.resolve(true);
};
