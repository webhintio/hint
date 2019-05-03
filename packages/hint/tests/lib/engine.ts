/* eslint-disable no-new */
import * as url from 'url';

import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import anyTest, { TestInterface, ExecutionContext } from 'ava';

import { misc } from '@hint/utils';

import { HintScope } from '../../src/lib/enums/hint-scope';
import { Configuration } from '../../src/lib/config';
import { HintResources, IFormatter, IConnector, IFetchOptions, IHint, HintMetadata, Problem } from '../../src/lib/types';
import { Category } from '../../src/lib/enums/category';
import { HintContext } from '../../src/lib/hint-context';

const { delay } = misc;

type EventEmitter2 = {
    EventEmitter2: () => void;
};

type EngineContext = {
    eventemitter: EventEmitter2;
};

const test = anyTest as TestInterface<EngineContext>;


// import { Engine } from '../../src/lib/engine';


class FakeConnector implements IConnector {
    public collect(target: url.URL) {
        return Promise.resolve(target);
    }

    public close() {
        return Promise.resolve();
    }

    public evaluate(): any { }

    public fetchContent(): any { }

    public querySelectorAll(): any { }
}

const initContext = (t: ExecutionContext<EngineContext>) => {
    const eventEmitter: EventEmitter2 = { EventEmitter2: function EventEmitter2() { } };

    eventEmitter.EventEmitter2.prototype.on = () => { };
    eventEmitter.EventEmitter2.prototype.emitAsync = () => {
        return Promise.resolve([]);
    };

    t.context.eventemitter = eventEmitter;
};

const loadScript = (context: EngineContext) => {
    const script = proxyquire('../../src/lib/engine', { eventemitter2: context.eventemitter });

    return script.Engine;
};

test.beforeEach(initContext);

test(`If config is an empty object, we should throw an error`, (t) => {
    const Engine = loadScript(t.context);

    t.throws(() => {
        // <any>{} to avoid the type checking if not is not possible to use {}
        new Engine({} as Configuration, {} as HintResources);
    }, Error);
});

test(`If the config object is invalid, we should throw an error`, (t) => {
    const Engine = loadScript(t.context);

    t.throws(() => {
        new Engine({
            invalidProperty: 'invalid',
            randomProperty: 'random'
        } as any, {} as HintResources);
    }, Error);
});

test(`If config.browserslist is an array of strings, we should initilize the property targetedBrowsers`, (t) => {
    const Engine = loadScript(t.context);
    const engineObject = new Engine({
        browserslist: ['> 5%'],
        connector: { name: 'connector' }
    } as Configuration, {
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    t.true(engineObject.targetedBrowsers.length > 0);
});

test(`If config.hints has some hints "off", we shouldn't create those hints`, (t) => {
    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor() {
            FakeDisallowedHint.called = true;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    class FakeManifestHint implements IHint {
        public static called: boolean = false;
        public constructor() {
            FakeManifestHint.called = true;
        }

        public static readonly meta: HintMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: HintScope.any
        }
    }

    const Engine = loadScript(t.context);

    new Engine({
        browserslist: [] as string[],
        connector: { name: 'connector' },
        extends: [],
        formatters: [],
        hints: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'off'
        },
        hintsTimeout: 60000,
        ignoredUrls: new Map(),
        parsers: []
    } as Configuration, {
        connector: FakeConnector,
        formatters: [],
        hints: [FakeDisallowedHint, FakeManifestHint],
        incompatible: [],
        missing: [],
        parsers: []
    });

    t.true(FakeDisallowedHint.called);
    t.false(FakeManifestHint.called);
});

test(`If a hint has the metadata "ignoredConnectors" set up, we shouldn't ignore those hints if the connector isn't in that property`, (t) => {
    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor(context: HintContext) {
            FakeDisallowedHint.called = true;

            context.on('fetch::end::*', () => { });
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    class FakeManifestHint implements IHint {
        public static called: boolean = false;
        public constructor(context: HintContext) {
            FakeManifestHint.called = true;

            context.on('fetch::error', () => { });
        }

        public static readonly meta: HintMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: HintScope.any
        }
    }

    sinon.spy(t.context.eventemitter.EventEmitter2.prototype, 'on');

    const Engine = loadScript(t.context);

    new Engine({
        browserslist: [],
        connector: { name: 'jsdom' },
        extends: [],
        formatters: [],
        hints: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        },
        hintsTimeout: 60000,
        ignoredUrls: new Map(),
        parsers: []
    }, {
        connector: FakeConnector,
        formatters: [],
        hints: [FakeDisallowedHint, FakeManifestHint],
        incompatible: [],
        missing: [],
        parsers: []
    });

    t.true(FakeDisallowedHint.called);
    t.true(FakeManifestHint.called);
    t.true(t.context.eventemitter.EventEmitter2.prototype.on.calledTwice);
    t.is(t.context.eventemitter.EventEmitter2.prototype.on.args[0][0], 'fetch::end::*');
    t.is(t.context.eventemitter.EventEmitter2.prototype.on.args[1][0], 'fetch::error');

    t.context.eventemitter.EventEmitter2.prototype.on.restore();
});

test(`If a hint has the metadata "ignoredConnectors" set up, we should ignore those hints if the connector is in that property`, (t) => {
    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor(context: HintContext) {
            FakeDisallowedHint.called = true;

            context.on('fetch::end::*', () => { });
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            ignoredConnectors: ['chromium'],
            schema: [],
            scope: HintScope.any
        }
    }

    class FakeManifestHint implements IHint {
        public static called: boolean = false;
        public constructor(context: HintContext) {
            FakeManifestHint.called = true;

            context.on('fetch::error', () => { });
        }

        public static readonly meta: HintMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: HintScope.any
        }
    }

    const Engine = loadScript(t.context);

    new Engine({
        browserslist: [],
        connector: { name: 'chromium' },
        extends: [],
        formatters: [],
        hints: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        },
        hintsTimeout: 60000,
        ignoredUrls: new Map(),
        parsers: []
    }, {
        connector: FakeConnector,
        formatters: [],
        hints: [FakeDisallowedHint, FakeManifestHint],
        incompatible: [],
        missing: [],
        parsers: []
    });

    t.false(FakeDisallowedHint.called);
    t.true(FakeManifestHint.called);
});

test(`If the hint scope is 'local' and the connector isn't local the hint should be ignored`, (t) => {
    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor() {
            FakeDisallowedHint.called = true;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    class FakeManifestHint implements IHint {
        public static called: boolean = false;
        public constructor(context: HintContext) {
            FakeManifestHint.called = true;

            context.on('fetch::error', () => { });
        }

        public static readonly meta: HintMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: HintScope.local
        }
    }

    const Engine = loadScript(t.context);

    new Engine({
        browserslist: [],
        connector: { name: 'chrome' },
        extends: [],
        formatters: [],
        hints: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        },
        hintsTimeout: 60000,
        ignoredUrls: new Map(),
        parsers: []
    }, {
        connector: FakeConnector,
        formatters: [],
        hints: [FakeDisallowedHint, FakeManifestHint],
        incompatible: [],
        missing: [],
        parsers: []
    });

    t.true(FakeDisallowedHint.called);
    t.false(FakeManifestHint.called);
});

test(`If the hint scope is 'site' and the connector is local the hint should be ignored`, (t) => {
    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor() {
            FakeDisallowedHint.called = true;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.site
        }
    }

    class FakeManifestHint implements IHint {
        public static called: boolean = false;
        public constructor(context: HintContext) {
            FakeManifestHint.called = true;

            context.on('fetch::error', () => { });
        }

        public static readonly meta: HintMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: HintScope.local
        }
    }

    const Engine = loadScript(t.context);

    new Engine({
        browserslist: [],
        connector: { name: 'local' },
        extends: [],
        formatters: [],
        hints: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        },
        hintsTimeout: 60000,
        ignoredUrls: new Map(),
        parsers: []
    }, {
        connector: FakeConnector,
        formatters: [],
        hints: [FakeDisallowedHint, FakeManifestHint],
        incompatible: [],
        missing: [],
        parsers: []
    });

    t.false(FakeDisallowedHint.called);
    t.true(FakeManifestHint.called);
});

test(`If the hint scope is 'any' and the connector is local the hint should be used`, (t) => {
    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor() {
            FakeDisallowedHint.called = true;
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    class FakeManifestHint implements IHint {
        public static called: boolean = false;
        public constructor(context: HintContext) {
            FakeManifestHint.called = true;

            context.on('fetch::error', () => { });
        }

        public static readonly meta: HintMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: HintScope.any
        }
    }

    const Engine = loadScript(t.context);

    new Engine({
        browserslist: [],
        connector: { name: 'local' },
        extends: [],
        formatters: [],
        hints: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        },
        hintsTimeout: 60000,
        ignoredUrls: new Map(),
        parsers: []
    }, {
        connector: FakeConnector,
        formatters: [],
        hints: [FakeDisallowedHint, FakeManifestHint],
        incompatible: [],
        missing: [],
        parsers: []
    });

    t.true(FakeDisallowedHint.called);
    t.true(FakeManifestHint.called);
});

test(`If the hint scope is 'any' and the connector isn't local the hint should be used`, (t) => {
    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor(context: HintContext) {
            FakeDisallowedHint.called = true;

            context.on('fetch::end::html', () => { });
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    class FakeManifestHint implements IHint {
        public static called: boolean = false;
        public constructor(context: HintContext) {
            FakeManifestHint.called = true;

            context.on('fetch::error', () => { });
        }

        public static readonly meta: HintMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: HintScope.any
        }
    }

    const Engine = loadScript(t.context);

    new Engine({
        browserslist: [],
        connector: { name: 'chrome' },
        extends: [],
        formatters: [],
        hints: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        },
        hintsTimeout: 60000,
        ignoredUrls: new Map(),
        parsers: []
    }, {
        connector: FakeConnector,
        formatters: [],
        hints: [FakeDisallowedHint, FakeManifestHint],
        incompatible: [],
        missing: [],
        parsers: []
    });

    t.true(FakeDisallowedHint.called);
    t.true(FakeManifestHint.called);
});

test(`If an event is emitted for an ignored url, it shouldn't propagate`, async (t) => {
    sinon.spy(t.context.eventemitter.EventEmitter2.prototype, 'emitAsync');

    const Engine = loadScript(t.context);
    const engineObject = new Engine({
        browserslist: [],
        connector: { name: 'connector' },
        extends: [],
        formatters: [],
        hints: { 'disallowed-headers': 'warning' },
        hintsTimeout: 60000,
        ignoredUrls: new Map([['all', [/.*\.domain1\.com\/.*/i]]]),
        parsers: []
    }, {
        connector: FakeConnector,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    await engineObject.emitAsync('traverse::start', { resource: 'http://www.domain1.com/test' });

    t.false(t.context.eventemitter.EventEmitter2.prototype.emitAsync.called);

    t.context.eventemitter.EventEmitter2.prototype.emitAsync.restore();
});

test(`If a hint is ignoring some url, it shouldn't run the event`, (t) => {
    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor(context: HintContext) {
            FakeDisallowedHint.called = true;

            context.on('fetch::end::html', () => { });
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    sinon.spy(t.context.eventemitter.EventEmitter2.prototype, 'on');

    const Engine = loadScript(t.context);

    const engine = new Engine({
        browserslist: [],
        connector: { name: 'connector' },
        extends: [],
        formatters: [],
        hints: { 'disallowed-headers': 'warning' },
        hintsTimeout: 60000,
        ignoredUrls: new Map([['all', [/.*\.domain1\.com\/.*/i]], ['disallowed-headers', [/.*\.domain2\.com\/.*/i]]]),
        parsers: []
    }, {
        connector: FakeConnector,
        formatters: [],
        hints: [FakeDisallowedHint],
        incompatible: [],
        missing: [],
        parsers: []
    });

    const eventHandler = t.context.eventemitter.EventEmitter2.prototype.on.args[0][1];

    t.is(eventHandler.call(engine, { resource: 'http://www.domain1.com/test' }), null);

    t.context.eventemitter.EventEmitter2.prototype.on.restore();
});

test(`If a hint is taking too much time, it should be ignored after the configured timeout`, async (t) => {
    class FakeDisallowedHint implements IHint {
        public static called: boolean = false;
        public constructor(context: HintContext) {
            FakeDisallowedHint.called = true;

            context.on('fetch::end::html', async () => {
                await delay(5000);

                return 'finish';
            });
        }

        public static readonly meta: HintMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: HintScope.any
        }
    }

    sinon.spy(t.context.eventemitter.EventEmitter2.prototype, 'on');

    const Engine = loadScript(t.context);

    new Engine({
        browserslist: [],
        connector: { name: 'connector' },
        extends: [],
        formatters: [],
        hints: { 'disallowed-headers': 'warning' },
        hintsTimeout: 1000,
        ignoredUrls: new Map(),
        parsers: []
    }, {
        connector: FakeConnector,
        formatters: [],
        hints: [FakeDisallowedHint],
        incompatible: [],
        missing: [],
        parsers: []
    });

    const eventHandler = t.context.eventemitter.EventEmitter2.prototype.on.args[0][1];

    t.is(await eventHandler.bind({ event: 'fetch::end::html' })({ resource: 'http://www.test.com/' }), null);

    t.context.eventemitter.EventEmitter2.prototype.on.restore();
});

test(`If there is no connector, it should throw an error`, (t) => {
    t.plan(1);

    const Engine = loadScript(t.context);

    try {
        new Engine({ connector: { name: 'invalidConnector' } } as Configuration, { connector: null } as any);
    } catch (err) {
        t.is(err.message, 'Connector "invalidConnector" not found');
    }
});

test('If connector is in the resources, we should init the connector', (t) => {
    class FakeConnectorInit implements IConnector {
        public static called: boolean = false;
        public constructor() {
            FakeConnectorInit.called = true;
        }

        public collect(target: url.URL) {
            return Promise.resolve(target);
        }

        public close() {
            return Promise.resolve();
        }

        public evaluate(): any { }

        public fetchContent(): any { }

        public querySelectorAll(): any { }
    }

    const Engine = loadScript(t.context);

    new Engine({ connector: { name: 'myconnector' } } as Configuration, {
        connector: FakeConnectorInit,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    t.true(FakeConnectorInit.called);
});

test('If connector is an object with valid data, we should init the connector', (t) => {
    class FakeConnectorInit implements IConnector {
        public static called: boolean = false;
        public constructor() {
            FakeConnectorInit.called = true;
        }

        public collect(target: url.URL) {
            return Promise.resolve(target);
        }

        public close() {
            return Promise.resolve();
        }

        public evaluate(): any { }

        public fetchContent(): any { }

        public querySelectorAll(): any { }
    }

    const Engine = loadScript(t.context);

    new Engine({
        connector: {
            name: 'myconnector',
            options: {}
        }
    } as Configuration, {
        connector: FakeConnectorInit,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    t.true(FakeConnectorInit.called);
});

test('formatter should return the formatter configured', (t) => {
    class FakeFormatter implements IFormatter {
        public constructor() { }

        public format(problems: Problem[]) {
            console.log(problems);
        }
    }

    const Engine = loadScript(t.context);
    const engineObject = new Engine({
        connector: { name: 'connector' },
        formatters: ['formatter']
    } as Configuration, {
        connector: FakeConnector,
        formatters: [FakeFormatter],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    t.true(engineObject.formatters[0] instanceof FakeFormatter);
});

test('pageContent should return the HTML', async (t) => {
    const html = '<html></html>';

    class FakeConnectorPageContent implements IConnector {

        public collect(target: url.URL) {
            return Promise.resolve(target);
        }

        public close() {
            return Promise.resolve();
        }

        public evaluate(): any { }

        public fetchContent(): any { }

        public querySelectorAll(): any { }

        public get html() {
            return html;
        }
    }

    const Engine = loadScript(t.context);
    const engineObject = new Engine({
        connector: {
            name: 'myconnector',
            options: {}
        }
    } as Configuration, {
        connector: FakeConnectorPageContent,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    t.is(await engineObject.pageContent, html);
});

test(`pageHeaders should return the page's response headers`, (t) => {
    const headers = { header1: 'value1' };

    class FakeConnectorPageContent implements IConnector {

        public collect(target: url.URL) {
            return Promise.resolve(target);
        }

        public close() {
            return Promise.resolve();
        }

        public evaluate(): any { }

        public fetchContent(): any { }

        public querySelectorAll(): any { }

        public get headers() {
            return headers;
        }
    }

    const Engine = loadScript(t.context);
    const engineObject = new Engine({
        connector: {
            name: 'myconnector',
            options: {}
        }
    } as Configuration, {
        connector: FakeConnectorPageContent,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    t.is(engineObject.pageHeaders, headers);
});

test('If connector.collect fails, it should return an error', async (t) => {
    class FakeConnectorCollectFail implements IConnector {
        private error: boolean = true;

        public collect(target: url.URL) {
            if (this.error) {
                throw new Error('Error runing collect');
            }

            return Promise.resolve(target);
        }

        public close() {
            return Promise.resolve();
        }

        public evaluate(): any { }

        public fetchContent(): any { }

        public querySelectorAll(): any { }
    }

    const Engine = loadScript(t.context);
    const engineObject = new Engine({
        connector: {
            name: 'myconnector',
            options: {}
        }
    } as Configuration, {
        connector: FakeConnectorCollectFail,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    const localUrl = new url.URL('http://localhost/');

    t.plan(1);
    try {
        await engineObject.executeOn(localUrl);
    } catch (err) {
        t.is(err.message, 'Error runing collect');
    }
});

test(`'executeOn' should return all messages`, async (t) => {
    class FakeConnectorCollect implements IConnector {

        public collect(target: url.URL) {
            return Promise.resolve(target);
        }

        public close() {
            return Promise.resolve();
        }

        public evaluate(): any { }

        public fetchContent(): any { }

        public querySelectorAll(): any { }
    }

    const Engine = loadScript(t.context);
    const engineObject = new Engine({
        connector: {
            name: 'myconnector',
            options: {}
        }
    } as Configuration, {
        connector: FakeConnectorCollect,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    const localUrl = new url.URL('http://localhost/');

    engineObject.report('1', Category.other, 1, 'node', { column: 1, line: 1 }, 'message', 'resource');
    engineObject.report('2', Category.other, 1, 'node', { column: 1, line: 2 }, 'message2', 'resource2');

    const result = await engineObject.executeOn(localUrl);

    t.is(result.length, 2);
});

test('executeOn should forward content if provided', async (t) => {
    const Engine = loadScript(t.context);

    class FakeConnectorCollect implements IConnector {
        private server: typeof Engine;
        public constructor(server: typeof Engine) {
            this.server = server;
        }

        public collect(target: url.URL, options?: IFetchOptions) {
            this.server.report('1', Category.other, 1, 'node', { column: 1, line: 1 }, options && options.content || '', target.href);

            return Promise.resolve(target);
        }

        public close() {
            return Promise.resolve();
        }

        public evaluate(): any { }

        public fetchContent(): any { }

        public querySelectorAll(): any { }
    }

    const testContent = 'Test Content';

    const engineObject = new Engine({
        connector: {
            name: 'myconnector',
            options: {}
        }
    } as Configuration, {
        connector: FakeConnectorCollect,
        formatters: [],
        hints: [],
        incompatible: [],
        missing: [],
        parsers: []
    });

    const localUrl = new url.URL('http://localhost/');

    const result = await engineObject.executeOn(localUrl, { content: testContent });

    t.is(result[0].message, testContent);
});
