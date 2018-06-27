import * as logger from '../utils/logging';
import getHintPackage from '../utils/packages/load-hint-package';

/** Prints the current hint version in the console. */
export default (): Promise<boolean> => {

    const pkg = getHintPackage();

    logger.log(`v${pkg.version}`);

    return Promise.resolve(true);
};
