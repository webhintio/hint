/* eslint sort-keys:0 */

import * as path from 'path';

import test from 'ava';

import * as misc from '../../../src/lib/utils/misc';

const testContext = [
    {
        name: 'Strips bom',
        file: 'bom.txt',
        content: ''
    },
    {
        name: 'Empty content',
        file: 'empty.txt',
        content: ''
    },
    {
        name: 'Dummy content',
        file: 'dummy.txt',
        content: 'dummy'
    }];

const resolve = (route) => {
    return path.join(__dirname, route);
};

test('getHeaderValueNormalized returns the normalized value of a given header', (t) => {
    const headers = {
        'my-header': '  Something  ',
        'my-other-header': ' Another'
    };

    const myHeader = misc.getHeaderValueNormalized(headers, 'My-Header');

    t.is(myHeader, 'something', `getHeaderValueNormalized doesn't trim and lowerCase the value`);
});

test('getHeaderValueNormalized returns the default value if no header found', (t) => {
    const headers = {
        'my-header': '  Something  ',
        'my-other-header': ' Another'
    };

    const myHeader = misc.getHeaderValueNormalized(headers, 'my-header2', 'missing');

    t.is(myHeader, 'missing', `getHeaderValueNormalized doesn't trim and lowerCase the value`);
});

test('hasProtocol checks if a URL has uses the given protocol', (t) => {
    const url = 'https://myresource.com/';
    const containsProtocol = misc.hasProtocol(url, 'https:');
    const doesnotContainProtocol = misc.hasProtocol(url, 'ftp:');

    t.true(containsProtocol, `hasProtocol doesn't detect correctly the protocol https:`);
    t.false(doesnotContainProtocol, `hasProtocol doesn't detect correctly the protocol ftp:`);
});

test('isDataUri detects if the URL is a data URI or not', (t) => {
    const noDataUri = 'https://myresource.com/';
    const dataUri = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D';

    t.false(misc.isDataURI(noDataUri), `isDataUri doesn't detect correctly ${noDataUri} is not a data URI`);
    t.true(misc.isDataURI(dataUri), `isDataUri doesn't detect correctly ${dataUri} is a data URI`);
});

test('isLocalFile detects if the URL is local or not', (t) => {
    const noLocalUri = 'https://myresource.com/';
    const localUri = 'file://somethinghere';

    t.false(misc.isLocalFile(noLocalUri), `isLocalFile doesn't detect correctly ${noLocalUri} is not a file URI`);
    t.true(misc.isLocalFile(localUri), `isLocalFile doesn't detect correctly ${localUri} is a file URI`);
});

test('isHTMLDocument retursn blindly true if protocol is "file:"', (t) => {
    const url = 'file://index.html';

    t.true(misc.isHTMLDocument(url, {}), `isHTMLDocument doesn't return true if URL protocol is "file:"`);
});

test('isHTMLDocument guesses if response is HTML based on the media type', (t) => {
    const url = 'https://someresource.com/index.html';
    const htmlResponse = { 'content-type': 'text/html' };
    const noHtmlResponse = { 'content-type': 'text/javascript' };
    const invalidContentType = { 'content-type': 'asdasdasda' };

    t.true(misc.isHTMLDocument(url, htmlResponse), `isHTMLDocument doesn't recognize HTML if header is text/html`);
    t.false(misc.isHTMLDocument(url, noHtmlResponse), `isHTMLDocument doesn't recognize is not HTML if header is text/javascript`);
    t.false(misc.isHTMLDocument(url, invalidContentType), `isHTMLDocument doesn't recognize invalid content types are not HTML`);
});

test('isHTTP detects if the URL is HTTP or not', (t) => {
    const noHttpUri = 'https://myresource.com/';
    const httpUri = 'http://somethinghere';

    t.false(misc.isHTTP(noHttpUri), `isHTTP doesn't detect correctly ${noHttpUri} is not a HTTP URI`);
    t.true(misc.isHTTP(httpUri), `isHTTP doesn't detect correctly ${httpUri} is a HTTP URI`);
});

test('isHTTPS detects if the URL is HTTP or not', (t) => {
    const noHttpsUri = 'http://myresource.com/';
    const httpsUri = 'https://somethinghere';

    t.false(misc.isHTTPS(noHttpsUri), `isHTTPS doesn't detect correctly ${noHttpsUri} is not a HTTPS URI`);
    t.true(misc.isHTTPS(httpsUri), `isHTTPS doesn't detect correctly ${httpsUri} is a HTTPS URI`);
});

test('isRegularProtocol detects if a URI uses HTTP(S) or not', (t) => {
    const httpUri = 'http://myresource.com/';
    const httpsUri = 'https://somethinghere';
    const ftpUri = 'ftp://somethinghere';
    const noProtocol = 'something';

    t.true(misc.isRegularProtocol(httpUri), `isRegularProtocol doesn't detect correctly ${httpUri} is a HTTP URI`);
    t.true(misc.isRegularProtocol(httpsUri), `isRegularProtocol doesn't detect correctly ${httpsUri} is a HTTPS URI`);
    t.false(misc.isRegularProtocol(ftpUri), `isRegularProtocol doesn't detect correctly ${ftpUri} is a FTP URI`);
    t.true(misc.isRegularProtocol(noProtocol), `isRegularProtocol doesn't detect correctly ${noProtocol} doesn't have a protocol`);
});

test('loadJSFile throws an exception if missing file', (t) => {
    t.throws(() => {
        misc.loadJSFile(resolve('./fixtures/dontexists.js'));
    });
});

test('loadJSFile throws an exception if invalid JS or JSON file', (t) => {
    t.throws(() => {
        try {
            misc.loadJSFile(resolve('./fixtures/dummy.txt'));
        } catch (e) {
            throw e;
        }
    });
});

test('loadJSFile loads a valid JS module', (t) => {
    try {
        const a = misc.loadJSFile(resolve('./fixtures/fixture.js'));

        t.is(a.property1, 'value1');
    } catch (e) {
        t.fail('Throws unexpected exception');
    }
});

test('loadJSONFile throws an exception if missing file', (t) => {
    t.throws(() => {
        misc.loadJSONFile(resolve('./fixture/dontexists.json'));
    });
});

test('loadJSONFile throws an exception if invalid JSON file', (t) => {
    t.throws(() => {
        misc.loadJSONFile(resolve('./fixture/fixture.js'));
    });
});

test('loadJSONFile loads a valid JSON file', (t) => {
    try {
        const a = misc.loadJSONFile(resolve('./fixtures/fixture.json'));

        t.is(a.property1, 'value1');
    } catch (e) {
        t.fail('Throws unexpected exception');
    }
});

test('toCamelCase transforms a - separated string to camelCase', (t) => {
    const source = 'this-is-a-string';
    const expected = 'thisIsAString';
    const transformed = misc.toCamelCase(source);

    t.is(transformed, expected, `${transformed} !== ${expected}`);
});

/** AVA macro for readFileAsync regular tests */
const readFileAsyncMacro = async (t, context) => {
    const location = path.join(__dirname, `./fixtures/${context.file}`);
    const content = await misc.readFileAsync(location);

    t.is(content, context.content);
};

testContext.forEach((context) => {
    test(`${context.name} - async`, readFileAsyncMacro, context);
});

test('readFileAsync throws exception if not found', async (t) => {
    await t.throws(misc.readFileAsync('idontexist'));
});
