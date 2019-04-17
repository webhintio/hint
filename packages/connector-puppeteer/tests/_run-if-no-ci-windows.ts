import * as isCI from 'is-ci';
import test from 'ava';

export const runIfNoCiAndWindows = (tests: Function) => {
    if (isCI && process.platform === 'win32') {
        test(`[puppeteer] ignoring Windows tests in CI`, (t) => {
            t.pass();
        });
    } else {
        tests();
    }
};
