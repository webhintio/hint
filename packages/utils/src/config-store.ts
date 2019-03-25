import * as Configstore from 'configstore';

const config = new Configstore('hint');

/** Get the value from the config store. */
export const get = (name: string): any => {
    return config.get(name);
};

/** Set a value in the config store. */
export const set = (name: string, value: any): any => {
    config.set(name, value);

    return value;
};
