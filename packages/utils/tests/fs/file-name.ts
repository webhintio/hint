import * as path from 'path';

import test from 'ava';

import { fileName } from '../../src/fs';

test('fileName has to return the same as path.basename', (t) => {
    const pathString = '/mnt/test/image.png';
    const expected = path.basename(pathString);

    t.is(fileName(pathString), expected);
});
