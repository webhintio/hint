import * as os from 'os';
import { URL } from 'url';

import test from 'ava';
import * as sinon from 'sinon';

import { getAsPathString } from '../../../src/lib/utils/get-as-path-string';

test.serial('getAsPathString returns the pathname of a URL if protocol is not "file:"', (t) => {
    const source = 'https://something.com/projects/';
    const expected = '/projects/';
    const uri = new URL(source);

    t.is(getAsPathString(uri), expected, `pathname not calculated correctly for non "file:" URLs`);
});

test.serial('getAsPathString return the normalized path name on Windows for a "file:" URL', (t) => {
    const source = 'file:///c:/projects/';
    const expected = 'c:/projects/';
    const uri = new URL(source);

    const stub = sinon.stub(os, 'platform').returns('win32');

    t.is(getAsPathString(uri), expected, `pathname not calculated correctly for Windows`);

    stub.restore();
});

test.serial('getAsPathString return the normalized path name on *nix for a "file:" URL', (t) => {
    const source = 'file:///mnt/projects/';
    const expected = '/mnt/projects/';
    const uri = new URL(source);

    const stub = sinon.stub(os, 'platform').returns('linux');

    t.is(getAsPathString(uri), expected, `pathname not calculated correctly for *nix`);

    stub.restore();
});
