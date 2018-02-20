import test from 'ava';

import * as contentType from '../../../src/lib/utils/content-type';

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
        'text/xml': 'xml'
    };

    const associations = Object.entries(mediaTypes);

    associations.forEach(([mediaType, group]) => {
        const calculatedGroup = contentType.getType(mediaType);

        t.is(calculatedGroup, group, `The calculated value for .${mediaType} is ${calculatedGroup} instead of ${group}`);
    });
});
