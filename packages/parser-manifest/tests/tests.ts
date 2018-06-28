import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import * as sinon from 'sinon';

import Parser from '../src/parser';

const elementLinkEventName = 'element::link';
const getElementLinkEventValue = (relAttribute: string = 'manifest', hrefAttribute: string = 'site.webmanifest') => {
    return {
        element: {
            getAttribute: (value) => {
                if (value === 'href') {
                    return hrefAttribute;
                }

                return relAttribute;
            },
            nodeName: 'LINK'
        },
        resource: 'https://example.com'
    };
};

const fetchEndEventName: string = 'fetch::end::manifest';
const fetchErrorEventName: string = 'fetch::error::manifest';
const fetchStartEventName: string = 'fetch::start::manifest';

const parseEventPrefix: string = 'parse::manifest';
const parseEndEventName: string = `${parseEventPrefix}::end`;
const parseErrorSchemaEventName: string = `${parseEventPrefix}::error::schema`;
const parseJSONErrorEventName: string = `${parseEventPrefix}::error::json`;

const scanEndEventName: string = 'scan::end';
const scanEndEventValue = { resource: 'https://example.com' };

const createNetworkDataObject = (manifestContent: string = '', statusCode: number = 200) => {
    return {
        request: {
            headers: null,
            url: ''
        },
        response: {
            body: {
                content: manifestContent,
                rawContent: null,
                rawResponse: null
            },
            charset: '',
            headers: {},
            hops: [],
            mediaType: '',
            statusCode,
            url: ''
        }
    };
};

const createMissingTest = async (t, relAttribute: string = 'manifest', hrefAttribute: string = '') => {
    const elementLinkEventValue = getElementLinkEventValue(relAttribute, hrefAttribute);
    const sandbox = sinon.createSandbox();
    const sonarwhal = t.context.engine;

    sandbox.spy(sonarwhal, 'emitAsync');

    new Parser(sonarwhal); // eslint-disable-line no-new

    await sonarwhal.emitAsync(elementLinkEventName, elementLinkEventValue);
    await sonarwhal.emitAsync(scanEndEventName, scanEndEventValue);

    t.is(sonarwhal.emitAsync.callCount, 2);
    t.is(sonarwhal.emitAsync.args[0][0], elementLinkEventName);
    t.is(sonarwhal.emitAsync.args[1][0], scanEndEventName);
    t.is(sonarwhal.emitAsync.args[1][1], scanEndEventValue);

    sandbox.restore();
};

const createParseTest = async (t, manifestContent: string, expectedEventName: string, verifyResult) => {
    const elementEventValue = getElementLinkEventValue();
    const sandbox = sinon.createSandbox();
    const sonarwhal = t.context.engine;

    sandbox.spy(sonarwhal, 'emitAsync');
    sandbox.stub(sonarwhal, 'fetchContent');

    t.context.engine.fetchContent.onCall(0)
        .returns(createNetworkDataObject(manifestContent));

    new Parser(sonarwhal); // eslint-disable-line no-new

    await sonarwhal.emitAsync(elementLinkEventName, elementEventValue);

    t.is(sonarwhal.emitAsync.callCount, 4);
    t.is(sonarwhal.emitAsync.args[0][0], elementLinkEventName);
    t.is(sonarwhal.emitAsync.args[1][0], fetchStartEventName);
    t.is(sonarwhal.emitAsync.args[2][0], fetchEndEventName);
    t.is(sonarwhal.emitAsync.args[3][0], expectedEventName);

    verifyResult(t, sonarwhal.emitAsync.args[3][1]);

    sandbox.restore();
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

test.beforeEach((t) => {
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
    t.context.engine.fetchContent = () => {};
});

test(`No event is emitted when no web app manifest file is specified`, async (t) => {
    const sandbox = sinon.createSandbox();
    const sonarwhal = t.context.engine;

    sandbox.spy(sonarwhal, 'emitAsync');

    new Parser(sonarwhal); // eslint-disable-line no-new

    await sonarwhal.emitAsync(scanEndEventName, scanEndEventValue);

    t.is(sonarwhal.emitAsync.callCount, 1);
    t.is(sonarwhal.emitAsync.args[0][0], scanEndEventName);
    t.is(sonarwhal.emitAsync.args[0][1], scanEndEventValue);

    sandbox.restore();
});

test(`No event is emitted when '<link rel="manifest" href=''>' is specified`, async (t) => {
    await createMissingTest(t);
});

test(`No event is emitted when only a '<link rel="stylesheet"...>' is specified`, async (t) => {
    await createMissingTest(t, 'stylesheet', 'style.css');
});

test(`'${fetchErrorEventName}' event is emitted when the manifest cannot be fetched`, async (t) => {
    const elementEventValue = getElementLinkEventValue();
    const sandbox = sinon.createSandbox();
    const sonarwhal = t.context.engine;

    sandbox.spy(sonarwhal, 'emitAsync');
    sandbox.stub(sonarwhal, 'fetchContent');

    sonarwhal.fetchContent.onCall(0).throws(createNetworkDataObject());

    new Parser(sonarwhal); // eslint-disable-line no-new

    await sonarwhal.emitAsync(elementLinkEventName, elementEventValue);
    await sonarwhal.emitAsync(scanEndEventName, scanEndEventValue);

    t.is(sonarwhal.emitAsync.callCount, 4);
    t.is(sonarwhal.emitAsync.args[0][0], elementLinkEventName);
    t.is(sonarwhal.emitAsync.args[1][0], fetchStartEventName);
    t.is(sonarwhal.emitAsync.args[2][0], fetchErrorEventName);
    t.not(typeof sonarwhal.emitAsync.args[2][1].error, 'undefined');
    t.is(sonarwhal.emitAsync.args[3][0], scanEndEventName);

    sandbox.restore();
});

test(`'${fetchErrorEventName}' event is emitted when the response for the web app manifest has a status code differenr the 200`, async (t) => {
    const elementEventValue = getElementLinkEventValue();
    const manifestContent = '500 Internal Server Error';
    const sandbox = sinon.createSandbox();
    const sonarwhal = t.context.engine;

    sandbox.spy(sonarwhal, 'emitAsync');
    sandbox.stub(sonarwhal, 'fetchContent');

    t.context.engine.fetchContent.onCall(0)
        .returns(createNetworkDataObject(manifestContent, 500));

    new Parser(sonarwhal); // eslint-disable-line no-new

    await sonarwhal.emitAsync(elementLinkEventName, elementEventValue);
    await sonarwhal.emitAsync(scanEndEventName, scanEndEventValue);

    t.is(sonarwhal.emitAsync.callCount, 4);
    t.is(sonarwhal.emitAsync.args[0][0], elementLinkEventName);
    t.is(sonarwhal.emitAsync.args[1][0], fetchStartEventName);
    t.is(sonarwhal.emitAsync.args[2][0], fetchErrorEventName);
    t.not(typeof sonarwhal.emitAsync.args[2][1].error, 'undefined');
    t.is(sonarwhal.emitAsync.args[3][0], scanEndEventName);

    sandbox.restore();
});

test(`'${parseEndEventName}' event is emitted when manifest content is valid`, async (t) => {
    const manifestContent = { name: '5' };
    const manifestContentParsed = {
        dir: 'auto',
        display: 'browser',
        name: '5',
        prefer_related_applications: false // eslint-disable-line camelcase
    };

    await createParseTest(t, JSON.stringify(manifestContent), parseEndEventName, (tt, result) => {
        tt.deepEqual(result.parsedContent, manifestContentParsed);
    });
});

test(`'${parseJSONErrorEventName}' event is emitted when manifest content is not valid JSON`, async (t) => {
    const manifestContent = 'invalid';

    await createParseTest(t, manifestContent, parseJSONErrorEventName, (tt, result) => {
        tt.not(typeof result.error, 'undefined');
    });
});

test(`'${parseErrorSchemaEventName}' event is emitted when manifest content is not valid because of an additional property`, async (t) => {
    const expectedPrettifiedErrors = [
        'Should NOT have additional properties. Additional property found \'additionalProperty\'.',
        'Should NOT have additional properties. Additional property found \'unknown_proprietary_extension\'.',
        '\'icons[0]\' should NOT have additional properties. Additional property found \'density\'.'
    ];

    /* eslint-disable camelcase */
    const manifestContent = {
        additionalProperty: 'x',

        /*
         * Known proprietary extension.
         * https://www.w3.org/TR/appmanifest/#extensibility
         */
        gcm_sender_id: { a: 5 },

        icons: [{
            density: 2,
            src: '/a.png'
        }],

        // Unknown proprietary extension.
        unknown_proprietary_extension: 5
    };
    /* eslint-enable camelcase */

    await createParseTest(t, JSON.stringify(manifestContent), parseErrorSchemaEventName, (tt, result) => {
        tt.is(result.prettifiedErrors.length, expectedPrettifiedErrors.length);
        tt.true(result.prettifiedErrors.every((e) => {
            return expectedPrettifiedErrors.includes(e);
        }));
    });
});
