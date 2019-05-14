import { debug, execa } from '../lib/utils';

/** Install all dependencies using `yarn`. */
export const installDependencies = () => {
    debug(`Installing dependencies`);

    return execa('yarn --ignore-engines');
};
