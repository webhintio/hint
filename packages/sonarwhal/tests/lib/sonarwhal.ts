/* eslint-disable no-new */
import * as url from 'url';

import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import test from 'ava';

import { delay } from '../../src/lib/utils/misc';
import { RuleScope } from '../../src/lib/enums/rulescope';
import { SonarwhalConfig } from '../../src/lib/config';

const eventEmitter = { EventEmitter2: function EventEmitter2() { } };

eventEmitter.EventEmitter2.prototype.on = () => { };
eventEmitter.EventEmitter2.prototype.emitAsync = () => {
    return Promise.resolve([]);
};

proxyquire('../../src/lib/sonarwhal', { eventemitter2: eventEmitter });

import { Sonarwhal } from '../../src/lib/sonarwhal';
import { SonarwhalResources, IFormatter, IConnector, IRule, RuleMetadata, Problem } from '../../src/lib/types';

class FakeConnector implements IConnector {
    private config;
    public constructor(server: Sonarwhal, config: object) {
        this.config = config;
    }

    public collect(target: url.Url) {
        return Promise.resolve(target);
    }

    public close() {
        return Promise.resolve();
    }
}

test.beforeEach((t) => {
    t.context.eventemitter = eventEmitter.EventEmitter2;
});

test.serial(`If config is an empty object, we should throw an error`, (t) => {
    t.throws(() => {
        // <any>{} to avoid the type checking if not is not possible to use just {}
        new Sonarwhal({} as SonarwhalConfig, {} as SonarwhalResources);
    }, Error);
});

test.serial(`If the config object is invalid, we should throw an error`, (t) => {
    t.throws(() => {
        new Sonarwhal({
            invalidProperty: 'invalid',
            randomProperty: 'random'
        } as any, {} as SonarwhalResources);
    }, Error);
});

test.serial(`If config.browserslist is an array of strings, we should initilize the property targetedBrowsers`, (t) => {
    const sonarwhalObject = new Sonarwhal({
        browserslist: ['> 5%'],
        connector: { name: 'connector' }
    } as SonarwhalConfig, {
        connector: FakeConnector,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: []
    });

    t.true(sonarwhalObject.targetedBrowsers.length > 0);
});

test.serial(`If config.rules has some rules "off", we shouldn't create those rules`, (t) => {
    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: RuleScope.any
        }
    }

    class FakeManifestRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeManifestRule.called = true;
            this.context = context;
        }

        public static readonly meta: RuleMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: RuleScope.any
        }
    }

    new Sonarwhal({
        browserslist: null,
        connector: { name: 'connector' },
        extends: [],
        formatters: [],
        ignoredUrls: [],
        parsers: [],
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'off'
        },
        rulesTimeout: null
    } as SonarwhalConfig, {
        connector: FakeConnector,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: [FakeDisallowedRule, FakeManifestRule]
    });

    t.true(FakeDisallowedRule.called);
    t.false(FakeManifestRule.called);
});

test.serial(`If a rule has the metadata "ignoredConnectors" set up, we shouldn't ignore those rules if the connector isn't in that property`, (t) => {
    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;

            context.on('fetch::end', () => { });
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: RuleScope.any
        }
    }

    class FakeManifestRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeManifestRule.called = true;
            this.context = context;

            context.on('fetch::error', () => { });
        }

        public static readonly meta: RuleMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: RuleScope.any
        }
    }

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');

    new Sonarwhal({
        browserslist: null,
        connector: { name: 'jsdom' },
        extends: [],
        formatters: [],
        ignoredUrls: [],
        parsers: [],
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        },
        rulesTimeout: null
    }, {
        connector: FakeConnector,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: [FakeDisallowedRule, FakeManifestRule]
    });

    t.true(FakeDisallowedRule.called);
    t.true(FakeManifestRule.called);
    t.true(t.context.eventemitter.prototype.on.calledTwice);
    t.is(t.context.eventemitter.prototype.on.args[0][0], 'fetch::end');
    t.is(t.context.eventemitter.prototype.on.args[1][0], 'fetch::error');

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If a rule has the metadata "ignoredConnectors" set up, we should ignore those rules if the connector is in that property`, (t) => {
    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;

            context.on('fetch::end', () => { });
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            ignoredConnectors: ['chrome'],
            schema: [],
            scope: RuleScope.any
        }
    }

    class FakeManifestRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeManifestRule.called = true;
            this.context = context;

            context.on('fetch::error', () => { });
        }

        public static readonly meta: RuleMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: RuleScope.any
        }
    }

    new Sonarwhal({
        browserslist: null,
        connector: { name: 'chrome' },
        extends: [],
        formatters: [],
        ignoredUrls: [],
        parsers: [],
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        },
        rulesTimeout: null
    }, {
        connector: FakeConnector,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: [FakeDisallowedRule, FakeManifestRule]
    });

    t.false(FakeDisallowedRule.called);
    t.true(FakeManifestRule.called);
});

test.serial(`If the rule scope is 'local' and the connector isn't local the rule should be ignored`, (t) => {
    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: RuleScope.any
        }
    }

    class FakeManifestRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeManifestRule.called = true;
            this.context = context;

            context.on('fetch::error', () => { });
        }

        public static readonly meta: RuleMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: RuleScope.local
        }
    }

    new Sonarwhal({
        browserslist: null,
        connector: { name: 'chrome' },
        extends: [],
        formatters: [],
        ignoredUrls: [],
        parsers: [],
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        },
        rulesTimeout: null
    }, {
        connector: FakeConnector,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: [FakeDisallowedRule, FakeManifestRule]
    });

    t.true(FakeDisallowedRule.called);
    t.false(FakeManifestRule.called);
});

test.serial(`If the rule scope is 'site' and the connector is local the rule should be ignored`, (t) => {
    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: RuleScope.site
        }
    }

    class FakeManifestRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeManifestRule.called = true;
            this.context = context;

            context.on('fetch::error', () => { });
        }

        public static readonly meta: RuleMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: RuleScope.local
        }
    }

    new Sonarwhal({
        browserslist: null,
        connector: { name: 'local' },
        extends: [],
        formatters: [],
        ignoredUrls: [],
        parsers: [],
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        },
        rulesTimeout: null
    }, {
        connector: FakeConnector,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: [FakeDisallowedRule, FakeManifestRule]
    });

    t.false(FakeDisallowedRule.called);
    t.true(FakeManifestRule.called);
});

test.serial(`If the rule scope is 'any' and the connector is local the rule should be used`, (t) => {
    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: RuleScope.any
        }
    }

    class FakeManifestRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeManifestRule.called = true;
            this.context = context;

            context.on('fetch::error', () => { });
        }

        public static readonly meta: RuleMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: RuleScope.any
        }
    }

    new Sonarwhal({
        browserslist: null,
        connector: { name: 'local' },
        extends: [],
        formatters: [],
        ignoredUrls: [],
        parsers: [],
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        },
        rulesTimeout: null
    }, {
        connector: FakeConnector,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: [FakeDisallowedRule, FakeManifestRule]
    });

    t.true(FakeDisallowedRule.called);
    t.true(FakeManifestRule.called);
});

test.serial(`If the rule scope is 'any' and the connector isn't local the rule should be used`, (t) => {
    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;

            context.on('fetch::end::html', () => { });
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: RuleScope.any
        }
    }

    class FakeManifestRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeManifestRule.called = true;
            this.context = context;

            context.on('fetch::error', () => { });
        }

        public static readonly meta: RuleMetadata = {
            id: 'manifest-exists',
            schema: [],
            scope: RuleScope.any
        }
    }

    new Sonarwhal({
        browserslist: null,
        connector: { name: 'chrome' },
        extends: [],
        formatters: [],
        ignoredUrls: [],
        parsers: [],
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        },
        rulesTimeout: null
    }, {
        connector: FakeConnector,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: [FakeDisallowedRule, FakeManifestRule]
    });

    t.true(FakeDisallowedRule.called);
    t.true(FakeManifestRule.called);
});

test.serial(`If an event is emitted for an ignored url, it shouldn't propagate`, async (t) => {
    sinon.spy(eventEmitter.EventEmitter2.prototype, 'emitAsync');

    const sonarwhalObject = new Sonarwhal({
        browserslist: null,
        connector: { name: 'connector' },
        extends: [],
        formatters: [],
        ignoredUrls: new Map([['all', [/.*\.domain1\.com\/.*/i]]]),
        parsers: [],
        rules: { 'disallowed-headers': 'warning' },
        rulesTimeout: null
    }, {
        connector: FakeConnector,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: []
    });

    await sonarwhalObject.emitAsync('event', { resource: 'http://www.domain1.com/test' });

    t.false(t.context.eventemitter.prototype.emitAsync.called);

    t.context.eventemitter.prototype.emitAsync.restore();
});

test.serial(`If a rule is ignoring some url, it shouldn't run the event`, (t) => {
    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;

            context.on('fetch::end::html', () => { });
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: RuleScope.any
        }
    }

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');

    new Sonarwhal({
        browserslist: null,
        connector: { name: 'connector' },
        extends: [],
        formatters: [],
        ignoredUrls: new Map([['all', [/.*\.domain1\.com\/.*/i]], ['disallowed-headers', [/.*\.domain2\.com\/.*/i]]]),
        parsers: [],
        rules: { 'disallowed-headers': 'warning' },
        rulesTimeout: null

    }, {
        connector: FakeConnector,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: [FakeDisallowedRule]
    });

    const eventHandler = t.context.eventemitter.prototype.on.args[0][1];

    t.is(eventHandler({ resource: 'http://www.domain1.com/test' }), null);

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If a rule is taking too much time, it should be ignored after the configured timeout`, async (t) => {
    class FakeDisallowedRule implements IRule {
        public static called: boolean = false;
        private context;
        public constructor(context) {
            FakeDisallowedRule.called = true;
            this.context = context;

            context.on('fetch::end::html', async () => {
                await delay(5000);

                return 'finish';
            });
        }

        public static readonly meta: RuleMetadata = {
            id: 'disallowed-headers',
            schema: [],
            scope: RuleScope.any
        }
    }

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');

    new Sonarwhal({
        browserslist: null,
        connector: { name: 'connector' },
        extends: [],
        formatters: [],
        ignoredUrls: new Map(),
        parsers: [],
        rules: { 'disallowed-headers': 'warning' },
        rulesTimeout: 1000
    }, {
        connector: FakeConnector,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: [FakeDisallowedRule]
    });

    const eventHandler = t.context.eventemitter.prototype.on.args[0][1];

    t.is(await eventHandler.bind({ event: 'fetch::end::html' })({ resource: 'http://www.test.com/' }), null);

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If there is no connector, it should throw an error`, (t) => {
    t.plan(1);

    try {
        new Sonarwhal({ connector: { name: 'invalidConnector' } } as SonarwhalConfig, { connector: null } as SonarwhalResources);
    } catch (err) {
        t.is(err.message, 'Connector "invalidConnector" not found');
    }
});

test.serial('If connector is in the resources, we should init the connector', (t) => {
    class FakeConnectorInit implements IConnector {
        public static called: boolean = false;
        private config;
        public constructor(server: Sonarwhal, config: object) {
            FakeConnectorInit.called = true;
            this.config = config;
        }

        public collect(target: url.Url) {
            return Promise.resolve(target);
        }

        public close() {
            return Promise.resolve();
        }
    }

    new Sonarwhal({ connector: { name: 'myconnector' } } as SonarwhalConfig, {
        connector: FakeConnectorInit,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: []
    });

    t.true(FakeConnectorInit.called);
});

test.serial('If connector is an object with valid data, we should init the connector', (t) => {
    class FakeConnectorInit implements IConnector {
        public static called: boolean = false;
        private config;
        public constructor(server: Sonarwhal, config: object) {
            FakeConnectorInit.called = true;
            this.config = config;
        }

        public collect(target: url.Url) {
            return Promise.resolve(target);
        }

        public close() {
            return Promise.resolve();
        }
    }

    new Sonarwhal({
        connector: {
            name: 'myconnector',
            options: {}
        }
    } as SonarwhalConfig, {
        connector: FakeConnectorInit,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: []
    });

    t.true(FakeConnectorInit.called);
});

test.serial('formatter should return the formatter configured', (t) => {
    class FakeFormatter implements IFormatter {
        public constructor() { }

        public format(problems: Array<Problem>) {
            console.log(problems);
        }
    }

    const sonarwhalObject = new Sonarwhal({
        connector: { name: 'connector' },
        formatters: ['formatter']
    } as SonarwhalConfig, {
        connector: FakeConnector,
        formatters: [FakeFormatter],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: []
    });

    t.true(sonarwhalObject.formatters[0] instanceof FakeFormatter);
});

test.serial('pageContent should return the HTML', async (t) => {
    const html = '<html></html>';

    class FakeConnectorPageContent implements IConnector {
        private config;
        public constructor(server: Sonarwhal, config: object) {
            this.config = config;
        }

        public collect(target: url.Url) {
            return Promise.resolve(target);
        }

        public close() {
            return Promise.resolve();
        }

        public get html() {
            return Promise.resolve(html);
        }
    }

    const sonarwhalObject = new Sonarwhal({
        connector: {
            name: 'myconnector',
            options: {}
        }
    } as SonarwhalConfig, {
        connector: FakeConnectorPageContent,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: []
    });

    t.is(await sonarwhalObject.pageContent, html);
});

test.serial(`pageHeaders should return the page's response headers`, (t) => {
    const headers = { header1: 'value1' };

    class FakeConnectorPageContent implements IConnector {
        private config;
        public constructor(server: Sonarwhal, config: object) {
            this.config = config;
        }

        public collect(target: url.Url) {
            return Promise.resolve(target);
        }

        public close() {
            return Promise.resolve();
        }

        public get headers() {
            return headers;
        }
    }

    const sonarwhalObject = new Sonarwhal({
        connector: {
            name: 'myconnector',
            options: {}
        }
    } as SonarwhalConfig, {
        connector: FakeConnectorPageContent,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: []
    });

    t.is(sonarwhalObject.pageHeaders, headers);
});

test.serial('If connector.collect fails, it should return an error', async (t) => {
    class FakeConnectorCollectFail implements IConnector {
        private error: boolean = true;
        private config;
        public constructor(server: Sonarwhal, config: object) {
            this.config = config;
        }

        public collect(target: url.Url) {
            if (this.error) {
                throw new Error('Error runing collect');
            }

            return Promise.resolve(target);
        }

        public close() {
            return Promise.resolve();
        }
    }

    const sonarwhalObject = new Sonarwhal({
        connector: {
            name: 'myconnector',
            options: {}
        }
    } as SonarwhalConfig, {
        connector: FakeConnectorCollectFail,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: []
    });

    const localUrl = new url.URL('http://localhost/');

    t.plan(1);
    try {
        await sonarwhalObject.executeOn(localUrl);
    } catch (err) {
        t.is(err.message, 'Error runing collect');
    }
});

test.serial('executeOn should return all messages', async (t) => {
    class FakeConnectorCollect implements IConnector {
        private config;
        public constructor(server: Sonarwhal, config: object) {
            this.config = config;
        }

        public collect(target: url.Url) {
            return Promise.resolve(target);
        }

        public close() {
            return Promise.resolve();
        }
    }

    const sonarwhalObject = new Sonarwhal({
        connector: {
            name: 'myconnector',
            options: {}
        }
    } as SonarwhalConfig, {
        connector: FakeConnectorCollect,
        formatters: [],
        incompatible: [],
        missing: [],
        parsers: [],
        rules: []
    });

    const localUrl = new url.URL('http://localhost/');

    sonarwhalObject.report('1', 1, 'node', { column: 1, line: 1 }, 'message', 'resource');
    sonarwhalObject.report('2', 1, 'node', { column: 1, line: 2 }, 'message2', 'resource2');

    const result = await sonarwhalObject.executeOn(localUrl);

    t.is(result.length, 2);
});
