import test from 'ava';

import { asyncTry } from '../src';

test(`asyncTry returns null if the function wrapped is rejected`, async (t) => {
    const fn = () => {
        return new Promise((resolve, reject) => {
            reject('error');
        });
    };

    const wrappedFunction = asyncTry(fn);
    const result = await wrappedFunction();

    t.is(result, null);
});

test(`asyncTry returns the same as the wrapped function`, async (t) => {
    const value = 'test';

    const fn = (): Promise<string> => {
        return new Promise((resolve) => {
            resolve(value);
        });
    };

    const wrappedFunction = asyncTry(fn);
    const result = await wrappedFunction();

    t.is(result, value);
});
