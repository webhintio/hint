import * as logger from '../utils/logging';
import { getSonarwhalPackage } from '../utils/misc';

/** Prints the current sonarwhal version in the console. */
export default (): Promise<boolean> => {

    const pkg = getSonarwhalPackage();

    logger.log(`v${pkg.version}`);

    return Promise.resolve(true);
};
