import * as url from 'url';

import test, { ExecutionContext } from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import * as sinon from 'sinon';

import Parser from '../src/parser';
import { Manifest, ManifestInvalidJSON, ManifestInvalidSchema, ManifestParsed, ManifestEvents } from '../src/types';
import { ProblemLocation, ISchemaValidationError, NetworkData, ElementFound } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';

const elementLinkEventName = 'element::link';
const getElementLinkEventValue = (relAttribute: string = 'manifest', hrefAttribute: string = 'site.webmanifest') => {
    return {
        element: {
            getAttribute: (value: string) => {
                if (value === 'href') {
                    return hrefAttribute;
                }

                return relAttribute;
            },
            nodeName: 'LINK',
            resolveUrl: (value: string) => {
                return new url.URL(value, 'https://example.com').href;
            }
        },
        resource: 'https://example.com'
    };
};

const getEngine = (): Engine<ManifestEvents> => {
    const engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<ManifestEvents>;

    engine.fetchContent = (target: string | url.URL, headers?: object): Promise<NetworkData> => {
        return {} as Promise<NetworkData>;
    };

    return engine;
};

const fetchEndEventName = 'fetch::end::manifest';
const fetchErrorEventName: string = 'fetch::error::manifest';
const fetchStartEventName: string = 'fetch::start::manifest';

const parseStartEventName: string = 'parse::start::manifest';
const parseEndEventName: string = 'parse::end::manifest';
const parseErrorSchemaEventName: string = 'parse::error::manifest::schema';
const parseJSONErrorEventName: string = 'parse::error::manifest::json';

const scanEndEventName = 'scan::end';
const scanEndEventValue = { resource: 'https://example.com' };

const createNetworkDataObject = (manifestContent: string = '', statusCode: number = 200): NetworkData => {
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
    } as any;
};

const createMissingTest = async (t: ExecutionContext, relAttribute: string = 'manifest', hrefAttribute: string = '') => {
    const elementLinkEventValue = getElementLinkEventValue(relAttribute, hrefAttribute);
    const sandbox = sinon.createSandbox();
    const engine = getEngine();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new Parser(engine); // eslint-disable-line no-new

    await engine.emitAsync(elementLinkEventName, elementLinkEventValue as ElementFound);
    await engine.emitAsync(scanEndEventName, scanEndEventValue);

    t.is(engineEmitAsyncSpy.callCount, 2);
    t.is(engineEmitAsyncSpy.args[0][0], elementLinkEventName);
    t.is(engineEmitAsyncSpy.args[1][0], scanEndEventName);
    t.is(engineEmitAsyncSpy.args[1][1], scanEndEventValue);

    sandbox.restore();
};

const createParseTest = async (t: ExecutionContext, manifestContent: string, expectedStartEventName: string, expectedEndEventName: string, verifyResult: Function) => {
    const elementEventValue = getElementLinkEventValue();
    const sandbox = sinon.createSandbox();
    const engine = getEngine();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');
    const engineFetchContentStub = sandbox.stub(engine, 'fetchContent');

    engineFetchContentStub.onCall(0)
        .resolves(createNetworkDataObject(manifestContent));

    new Parser(engine); // eslint-disable-line no-new

    await engine.emitAsync(elementLinkEventName, elementEventValue as ElementFound);

    t.is(engineEmitAsyncSpy.callCount, 5);
    t.is(engineEmitAsyncSpy.args[0][0], elementLinkEventName);
    t.is(engineEmitAsyncSpy.args[1][0], fetchStartEventName);
    t.is(engineEmitAsyncSpy.args[2][0], fetchEndEventName);
    t.is(engineEmitAsyncSpy.args[3][0], expectedStartEventName);
    t.is(engineEmitAsyncSpy.args[4][0], expectedEndEventName);

    verifyResult(t, engineEmitAsyncSpy.args[4][1]);

    sandbox.restore();
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

test(`No event is emitted when no web app manifest file is specified`, async (t) => {
    const sandbox = sinon.createSandbox();
    const engine = getEngine();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    new Parser(engine); // eslint-disable-line no-new

    await engine.emitAsync(scanEndEventName, scanEndEventValue);

    t.is(engineEmitAsyncSpy.callCount, 1);
    t.is(engineEmitAsyncSpy.args[0][0], scanEndEventName);
    t.is(engineEmitAsyncSpy.args[0][1], scanEndEventValue);

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
    const engine = getEngine();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');
    const engineFetchContentStub = sandbox.stub(engine, 'fetchContent');

    engineFetchContentStub.onCall(0).throws(createNetworkDataObject());

    new Parser(engine); // eslint-disable-line no-new

    await engine.emitAsync(elementLinkEventName, elementEventValue as ElementFound);
    await engine.emitAsync(scanEndEventName, scanEndEventValue);

    t.is(engineEmitAsyncSpy.callCount, 4);
    t.is(engineEmitAsyncSpy.args[0][0], elementLinkEventName);
    t.is(engineEmitAsyncSpy.args[1][0], fetchStartEventName);
    t.is(engineEmitAsyncSpy.args[2][0], fetchErrorEventName);
    t.not(typeof (engineEmitAsyncSpy.args[2][1] as any).error, 'undefined');
    t.is(engineEmitAsyncSpy.args[3][0], scanEndEventName);

    sandbox.restore();
});

test(`'${fetchErrorEventName}' event is emitted when the response for the web app manifest has a status code differenr the 200`, async (t) => {
    const elementEventValue = getElementLinkEventValue();
    const manifestContent = '500 Internal Server Error';
    const sandbox = sinon.createSandbox();
    const engine = getEngine();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');
    const engineFetchContentStub = sandbox.stub(engine, 'fetchContent');

    engineFetchContentStub.onCall(0)
        .resolves(createNetworkDataObject(manifestContent, 500));

    new Parser(engine); // eslint-disable-line no-new

    await engine.emitAsync(elementLinkEventName, elementEventValue as ElementFound);
    await engine.emitAsync(scanEndEventName, scanEndEventValue);

    t.is(engineEmitAsyncSpy.callCount, 4);
    t.is(engineEmitAsyncSpy.args[0][0], elementLinkEventName);
    t.is(engineEmitAsyncSpy.args[1][0], fetchStartEventName);
    t.is(engineEmitAsyncSpy.args[2][0], fetchErrorEventName);
    t.not(typeof (engineEmitAsyncSpy.args[2][1] as any).error, 'undefined');
    t.is(engineEmitAsyncSpy.args[3][0], scanEndEventName);

    sandbox.restore();
});

test(`'${parseEndEventName}' event is emitted when manifest content is valid`, async (t) => {
    const manifestContent = { name: '5' };
    const manifestContentParsed = {
        dir: 'auto',
        display: 'browser',
        name: '5',
        prefer_related_applications: false // eslint-disable-line camelcase
    } as Manifest;

    await createParseTest(t, JSON.stringify(manifestContent), parseStartEventName, parseEndEventName, (tt: ExecutionContext, result: ManifestParsed) => {
        tt.deepEqual(result.parsedContent, manifestContentParsed);
    });
});

test(`'${parseEndEventName}' event includes location information`, async (t) => {
    const manifestContent = `{
    "name": "5"
};`;

    await createParseTest(t, manifestContent, parseStartEventName, parseEndEventName, (tt: ExecutionContext, result: ManifestParsed) => {
        const nameLocation = result.getLocation('name');
        const valueLocation = result.getLocation('name', { at: 'value' });

        tt.is(nameLocation && nameLocation.line, 1);
        tt.is(nameLocation && nameLocation.column, 5);
        tt.is(valueLocation && valueLocation.line, 1);
        tt.is(valueLocation && valueLocation.column, 12);
    });
});

test(`'${parseJSONErrorEventName}' event is emitted when manifest content is not valid JSON`, async (t) => {
    const manifestContent = 'invalid';

    await createParseTest(t, manifestContent, parseStartEventName, parseJSONErrorEventName, (tt: ExecutionContext, result: ManifestInvalidJSON) => {
        tt.not(typeof result.error, 'undefined');
    });
});

test(`'${parseErrorSchemaEventName}' event is emitted when manifest content is not valid because of an additional property`, async (t) => {
    const expectedPrettifiedErrors = [
        `'root' should NOT have additional properties. Additional property found 'additionalProperty'.`,
        `'root' should NOT have additional properties. Additional property found 'unknown_proprietary_extension'.`,
        `'icons[0]' should NOT have additional properties. Additional property found 'density'.`
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

    await createParseTest(t, JSON.stringify(manifestContent), parseStartEventName, parseErrorSchemaEventName, (tt: ExecutionContext, result: ManifestInvalidSchema) => {
        tt.is(result.prettifiedErrors.length, expectedPrettifiedErrors.length);
        tt.true(result.prettifiedErrors.every((e: any) => {
            return expectedPrettifiedErrors.includes(e);
        }));
    });
});

test(`'${parseErrorSchemaEventName}' event includes location information`, async (t) => {
    const expectedLocations: { [message: string]: ProblemLocation } = {
        [`'icons[0]' should NOT have additional properties. Additional property found 'density'.`]: {
            column: 9,
            line: 4
        },
        [`'root' should NOT have additional properties. Additional property found 'additionalProperty'.`]: {
            column: 5,
            line: 1
        },
        [`'root' should NOT have additional properties. Additional property found 'unknown_proprietary_extension'.`]: {
            column: 5,
            line: 7
        }
    };

    const manifestContent = `{
    "additionalProperty": "x",
    "gcm_sender_id": { "a": 5 },
    "icons": [{
        "density": 2,
        "src": "/a.png"
    }],
    "unknown_proprietary_extension": 5
}`;

    await createParseTest(t, manifestContent, parseStartEventName, parseErrorSchemaEventName, (tt: ExecutionContext, result: ManifestInvalidSchema) => {

        result.errors.forEach((error: ISchemaValidationError, i: number) => {
            const message = result.prettifiedErrors[i];
            const expectedLocation = expectedLocations[message];

            tt.is(error.location && error.location.line, expectedLocation.line);
            tt.is(error.location && error.location.column, expectedLocation.column);
        });
    });
});

test('It does not emit redundant fetch events', async (t: ExecutionContext) => {
    const elementEventValue = getElementLinkEventValue();
    const sandbox = sinon.createSandbox();
    const engine = getEngine();
    const networkData = createNetworkDataObject(`{ "name": "5" };`);

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');
    const engineFetchContentStub = sandbox.stub(engine, 'fetchContent');

    engineFetchContentStub.onCall(0)
        .resolves(networkData);

    new Parser(engine); // eslint-disable-line no-new

    await engine.emitAsync(fetchEndEventName, { element: null, ...networkData, resource: 'https://example.com/site.webmanifest' });
    await engine.emitAsync(elementLinkEventName, elementEventValue as ElementFound);

    t.log(engineEmitAsyncSpy.args);

    t.is(engineEmitAsyncSpy.callCount, 4);
    t.is(engineEmitAsyncSpy.args[0][0], fetchEndEventName);
    t.is(engineEmitAsyncSpy.args[1][0], parseStartEventName);
    t.is(engineEmitAsyncSpy.args[2][0], parseEndEventName);
    t.is(engineEmitAsyncSpy.args[3][0], elementLinkEventName);

    sandbox.restore();
});
