import { logger } from '@hint/utils';
import { loadHintPackage } from '../utils/packages/load-hint-package';


/** Prints the current hint version in the console. */
export default (): Promise<boolean> => {

    const pkg = loadHintPackage();

    logger.log(`v${pkg.version}`);

    return Promise.resolve(true);
};
