import test from 'ava';

const isWsl: boolean = require('is-wsl');

import { getPlatform } from '../../src/misc';

test(`getPlatform returns the current platform`, (t) => {
    const platform = getPlatform();

    t.is(platform, isWsl ? 'wsl' : process.platform);
});
