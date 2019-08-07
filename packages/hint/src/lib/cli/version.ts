import { logger, packages } from '@hint/utils';

const { loadHintPackage } = packages;

/** Prints the current hint version in the console. */
export default (): Promise<boolean> => {

    const pkg = loadHintPackage();

    logger.log(`v${pkg.version}`);

    return Promise.resolve(true);
};
