import * as path from 'path';

import { CLIOptions } from '../types';
import * as logger from '../utils/logging';
import { loadJSONFile } from '../utils/misc';

const pkg = loadJSONFile(path.join(__dirname, '../../../../package.json'));

/** Prints the current sonarwhal version in the console. */
export const printVersion = (actions: CLIOptions): Promise<boolean> => {
    if (!actions.version) {
        return Promise.resolve(false);
    }

    logger.log(`v${pkg.version}`);

    return Promise.resolve(true);
};
