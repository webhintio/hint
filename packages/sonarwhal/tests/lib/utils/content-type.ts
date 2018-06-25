import test from 'ava';

import * as contentType from '../../../src/lib/utils/content-type';
import * as fs from 'fs';

test('determineMediaTypeBasedOnFileExtension determines the right mime type based on the extension', (t) => {
    const extensions = {
        css: 'text/css',
        gif: 'image/gif',
        htm: 'text/html',
        html: 'text/html',
        ico: 'image/x-icon',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        js: 'text/javascript',
        otf: 'font/otf',
        png: 'image/png',
        svg: 'image/svg+xml',
        ttf: 'font/ttf',
        webmanifest: 'application/manifest+json',
        webp: 'image/webp',
        woff: 'font/woff',
        woff2: 'font/woff2',
        xhtml: 'application/xhtml+xml',
        xml: 'text/xml'
    };

    const associations = Object.entries(extensions);

    associations.forEach(([extension, mediaType]) => {
        const calculatedMediaType = contentType.determineMediaTypeBasedOnFileExtension(`something.${extension}`);

        t.is(calculatedMediaType, mediaType, `The calculated value for .${extension} is ${calculatedMediaType} instead of ${mediaType}`);
    });
});

test('determineMediaTypeBasedOnFileName sets the mime type as `text/json` if the file name matches `.somethingrc`', (t) => {
    const configFileNames = ['.babelrc', '.Babelrc'];
    const nonConfigFileNames = ['something.rc', '.rc', '.babel', 'index.html'];
    const jsonRawContent = fs.readFileSync(`${__dirname}/fixtures/fixture.json`); // eslint-disable-line no-sync
    const nonJsonRawContent = fs.readFileSync(`${__dirname}/fixtures/dummy.txt`); // eslint-disable-line no-sync

    configFileNames.forEach((fileName) => {
        const calculatedMediaType = contentType.determineMediaTypeBasedOnFileName(`localhost:3000/${fileName}`, jsonRawContent);

        t.is(calculatedMediaType, 'text/json', `The calculated value for ${fileName} is ${calculatedMediaType} instead of 'text/json'`);
    });

    configFileNames.forEach((fileName) => {
        const calculatedMediaType = contentType.determineMediaTypeBasedOnFileName(`localhost:3000/${fileName}`, nonJsonRawContent);

        t.is(calculatedMediaType, 'text/plain', `The calculated value for ${fileName} is ${calculatedMediaType} instead of 'text/plain'`);
    });

    nonConfigFileNames.forEach((fileName) => {
        const calculatedMediaType = contentType.determineMediaTypeBasedOnFileName(`localhost:3000/${fileName}`, nonJsonRawContent);

        t.is(calculatedMediaType, null, `The calculated value for ${fileName} is ${calculatedMediaType} instead of null`);
    });

    const calculatedMediaType = contentType.determineMediaTypeBasedOnFileName('', nonJsonRawContent);

    t.is(calculatedMediaType, null, `The calculated value for '' is ${calculatedMediaType} instead of null`);
});

test('determineMediaTypeBasedOnFileExtension returns null if no extension in file', (t) => {
    const calculatedMediaType = contentType.determineMediaTypeBasedOnFileExtension(`something.something`);

    t.is(calculatedMediaType, null, `The calculated value for .something is ${calculatedMediaType} instead of null`);
});

test('determineMediaTypeBasedOnFileExtension returns null if not recognized extension', (t) => {
    const calculatedMediaType = contentType.determineMediaTypeBasedOnFileExtension(`something`);

    t.is(calculatedMediaType, null, `The calculated value for .something is ${calculatedMediaType} instead of null`);
});

test('getType returns the right group for a variety of mediaTypes', (t) => {
    const mediaTypes = {
        'application/json': 'json',
        'application/manifest+json': 'manifest',
        'application/vnd.ms-fontobject': 'font',
        'application/xhtml+xml': 'html',
        'font/woff': 'font',
        'image/jpeg': 'image',
        'image/png': 'image',
        'text/css': 'css',
        'text/csv': 'unknown',
        'text/html': 'html',
        'text/javascript': 'script',
        'text/json': 'json',
        'text/plain': 'txt',
        'text/xml': 'xml',
        '': 'unknown'
    };

    const associations = Object.entries(mediaTypes);

    associations.forEach(([mediaType, group]) => {
        const calculatedGroup = contentType.getType(mediaType);

        t.is(calculatedGroup, group, `The calculated value for .${mediaType} is ${calculatedGroup} instead of ${group}`);
    });
});

test('isTextMediaType returns true or false if the media type is a text one or not', (t) => {
    const mediaTypes = {
        'application/manifest+json': true,
        'application/vnd.ms-fontobject': false,
        'application/xhtml+xml': true,
        'font/woff': false,
        'image/jpeg': false,
        'image/png': false,
        'text/css': true,
        'text/csv': true,
        'text/html': true,
        'text/javascript': true,
        'text/xml': true
    };

    const associations = Object.entries(mediaTypes);

    associations.forEach(([mediaType, value]) => {
        const calculatedValue = contentType.isTextMediaType(mediaType);

        t.is(calculatedValue, value, `The calculated value for .${mediaType} is ${calculatedValue} instead of ${value}`);
    });
});
