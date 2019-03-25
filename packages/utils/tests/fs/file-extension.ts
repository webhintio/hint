import test from 'ava';

import { fileExtension } from '../../src/fs';

test('if the path is an url, fileExtension should return the right extension', (t) => {
    const expected = 'js';

    t.is(fileExtension('https://example.com/script.js'), expected);
});

test('if the path is a local file, fileExtension should return the right extension', (t) => {
    const expected = 'txt';

    t.is(fileExtension('c:\\test\\text.txt'), expected);
});

test('if the path is a local file (linux), fileExtension should return the right extension', (t) => {
    const expected = 'png';

    t.is(fileExtension('/mnt/test/image.png'), expected);
});
