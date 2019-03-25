import test from 'ava';

import { isLocalFile } from '../../src/network';

test('isLocalFile detects if the URL is local or not', (t) => {
    const noLocalUri = 'https://myresource.com/';
    const localUri = 'file://somethinghere';

    t.false(isLocalFile(noLocalUri), `isLocalFile doesn't detect correctly ${noLocalUri} is not a file URI`);
    t.true(isLocalFile(localUri), `isLocalFile doesn't detect correctly ${localUri} is a file URI`);
});
