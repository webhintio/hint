import test from 'ava';

import { getPlatform } from '../../src/misc';

test(`getPlatform returns the current platform`, (t) => {
    const platform = getPlatform();

    t.is(platform, process.platform);
});
