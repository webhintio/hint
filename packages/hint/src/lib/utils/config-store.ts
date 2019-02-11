import * as Configstore from 'configstore';

import getHintPackage from './packages/load-hint-package';

const pkg = getHintPackage();

const config = new Configstore(pkg.name);

export const get = (name: string): any => {
    return config.get(name);
};

export const set = (name: string, value: any): any => {
    config.set(name, value);

    return value;
};
