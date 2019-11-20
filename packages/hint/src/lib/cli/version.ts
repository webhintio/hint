import { logger, loadHintPackage } from '@hint/utils';

/** Prints the current hint version in the console. */
export default (): Promise<boolean> => {

    const pkg = loadHintPackage();

    logger.log(`v${pkg.version}`);

    return Promise.resolve(true);
};
