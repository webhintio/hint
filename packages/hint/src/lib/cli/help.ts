import { options } from './options';
import * as logger from '../utils/logging';
import { CLIOptions } from '../types';

/** Prints the help menu in the console. */
export default (actions: CLIOptions): Promise<boolean> => {
    // We print the help
    const entries = Object.entries(actions);
    const showHelp = entries.reduce((result, [key, value]) => {
        if (key === 'help' && value) {
            return true;
        }

        // We validate there isn't any other option selected
        if (typeof value === 'boolean' && value) {
            return false;
        }

        // This is for the `_` property. If there are sites, we don't show help neither
        if (Array.isArray(value) && value.length > 0) {
            return false;
        }

        return result && true;
    }, true);

    if (!showHelp) {
        return Promise.resolve(false);
    }

    logger.log(options.generateHelp());

    return Promise.resolve(true);
};
