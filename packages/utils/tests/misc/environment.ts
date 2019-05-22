import test from 'ava';

import { getVariable } from '../../src/misc';

test(`getVariable returns an environment variable`, (t) => {
    const keys = Object.keys(process.env); // eslint-disable-line no-process-env
    const key = keys[0];
    const envValue = getVariable(key);

    t.is(envValue, process.env[key]); // eslint-disable-line no-process-env
});
