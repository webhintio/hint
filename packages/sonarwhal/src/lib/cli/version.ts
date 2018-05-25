import { CLIOptions } from '../types';
import * as logger from '../utils/logging';
import { getSonarwhalPackage } from '../utils/misc';

/** Prints the current sonarwhal version in the console. */
export default (actions: CLIOptions): Promise<boolean> => {
    if (!actions.version) {
        return Promise.resolve(false);
    }

    const pkg = getSonarwhalPackage();

    logger.log(`v${pkg.version}`);

    return Promise.resolve(true);
};
