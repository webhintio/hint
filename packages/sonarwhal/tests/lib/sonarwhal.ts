/* eslint-disable no-new */
import * as url from 'url';

import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import test from 'ava';

import { delay } from '../../src/lib/utils/misc';
import { Scope } from '../../src/lib/enums/scope';

const resourceLoader = {
    loadConnector() {
        return () => { };
    },
    loadRules() { }
};
const eventEmitter = { EventEmitter2: function EventEmitter2() { } };

eventEmitter.EventEmitter2.prototype.on = () => { };
eventEmitter.EventEmitter2.prototype.emitAsync = () => {
    return Promise.resolve([]);
};

proxyquire('../../src/lib/sonarwhal', {
    './utils/resource-loader': resourceLoader,
    eventemitter2: eventEmitter
});

import { Sonarwhal } from '../../src/lib/sonarwhal';

test.beforeEach((t) => {
    t.context.resourceLoader = resourceLoader;
    t.context.eventemitter = eventEmitter.EventEmitter2;
});

test.afterEach.always((t) => {
    if (t.context.resourceLoader.loadRules.restore) {
        t.context.resourceLoader.loadRules.restore();
    }
    if (t.context.resourceLoader.loadConnector.restore) {
        t.context.resourceLoader.loadConnector.restore();
    }
});

test(`If config is an empty object, we should throw an error`, (t) => {
    t.throws(() => {
        // <any>{} to avoid the type checking if not is not possible to use just {}
        new Sonarwhal({} as any);
    }, Error);
});

test(`If config doesn't have any rule, we shouldn't create any rules`, (t) => {
    sinon.spy(t.context.resourceLoader, 'loadRules');

    new Sonarwhal({ connector: 'connector' });

    t.false(t.context.resourceLoader.loadRules.called);
});

test(`If the config object is invalid, we should throw an error`, (t) => {
    t.throws(() => {
        new Sonarwhal({
            invalidProperty: 'invalid',
            randomProperty: 'random'
        } as any);
    }, Error);
});

test(`If a rule config is invalid, we should throw an error`, (t) => {
    t.throws(() => {
        new Sonarwhal({
            connector: 'connector',
            rules: { 'disallowed-headers': 'invalid-severity' }
        });
    }, Error);
});

test(`If a rule doesn't exist, we should throw an error`, (t) => {
    t.throws(() => {
        new Sonarwhal({
            connector: 'connector',
            rules: { 'invalid-rule': 'error' }
        });
    }, Error);
});

test.serial(`If config.browserslist is an string, we should initilize the property targetedBrowsers`, (t) => {
    sinon.spy(t.context.resourceLoader, 'loadRules');

    const sonarwhalObject = new Sonarwhal({
        browserslist: '> 5%',
        connector: 'connector'
    });

    t.true(sonarwhalObject.targetedBrowsers.length > 0);

    t.false(t.context.resourceLoader.loadRules.called);
});

/*
 * test.serial('If config.plugins is an array we should create just those plugins', (t) => {
 *     const plugin = {
 *         create() {
 *             return {};
 *         }
 *     };
 *     sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
 *     t.context.plugin = plugin;
 *     sinon.stub(t.context.resourceLoader, 'getPlugins').returns(new Map([
 *         ['plugin1Name', plugin],
 *         ['plugin2Name', plugin],
 *         ['plubin3Name', plugin]
 *     ]));
 *     sinon.stub(plugin, 'create')
 *         .onFirstCall()
 *         .returns({ 'fetch::end': () => { } })
 *         .onSecondCall()
 *         .returns({
 *             'fetch::end': () => { },
 *             'fetch::error': () => { }
 *         });
 *     new Sonarwhal({ connector: 'connector', plugins: ['plugin1Name', 'plugin2Name'] });
 *     t.true(t.context.resourceLoader.getPlugins.called);
 *     t.is(t.context.plugin.create.callCount, 2);
 *     t.is(t.context.eventemitter.prototype.on.callCount, 3);
 *     t.is(t.context.eventemitter.prototype.on.args[0][0], 'fetch::end');
 *     t.is(t.context.eventemitter.prototype.on.args[1][0], 'fetch::end');
 *     t.is(t.context.eventemitter.prototype.on.args[2][0], 'fetch::error');
 *     t.context.eventemitter.prototype.on.restore();
 * });
 */

test.serial('If config.rules is an object with rules, we should create just those rules', (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', rule],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create')
        .onFirstCall()
        .returns({ 'fetch::end': () => { } })
        .onSecondCall()
        .returns({ 'fetch::error': () => { } });

    new Sonarwhal({
        connector: 'connector',
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        }
    });

    t.true(t.context.resourceLoader.loadRules.called);
    t.true(t.context.rule.create.calledTwice);
    t.true(t.context.eventemitter.prototype.on.calledTwice);
    t.is(t.context.eventemitter.prototype.on.args[0][0], 'fetch::end');
    t.is(t.context.eventemitter.prototype.on.args[1][0], 'fetch::error');

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If config.rules has some rules "off", we shouldn't create those rules`, (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', rule],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });

    new Sonarwhal({
        connector: 'connector',
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'off'
        }
    });

    t.true(t.context.resourceLoader.loadRules.called);
    t.true(t.context.rule.create.calledOnce);

    t.context.eventemitter.prototype.on.restore();
});

test.serial('If config.rules is an array with rules, we should create just those rules', (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', rule],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create')
        .onFirstCall()
        .returns({ 'fetch::end': () => { } })
        .onSecondCall()
        .returns({ 'fetch::error': () => { } });

    new Sonarwhal({
        connector: 'connector',
        rules: [
            'disallowed-headers:warning',
            'manifest-exists:warning'
        ]
    });

    t.true(t.context.resourceLoader.loadRules.called);
    t.true(t.context.rule.create.calledTwice);
    t.true(t.context.eventemitter.prototype.on.calledTwice);
    t.is(t.context.eventemitter.prototype.on.args[0][0], 'fetch::end');
    t.is(t.context.eventemitter.prototype.on.args[1][0], 'fetch::error');

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If config.rules is an array and has some rules "off", we shouldn't create those rules`, (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', rule],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });

    new Sonarwhal({
        connector: 'connector',
        rules: [
            'disallowed-headers:warning',
            'manifest-exists:off'
        ]
    });

    t.true(t.context.resourceLoader.loadRules.called);
    t.true(t.context.rule.create.calledOnce);

    t.context.eventemitter.prototype.on.restore();
});

test.serial('If config.rules is an array with shorthand warning rules, we should create just those rules', (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', rule],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create')
        .onFirstCall()
        .returns({ 'fetch::end': () => { } })
        .onSecondCall()
        .returns({ 'fetch::error': () => { } });

    new Sonarwhal({
        connector: 'connector',
        rules: [
            '?disallowed-headers',
            'manifest-exists:warning'
        ]
    });

    t.true(t.context.resourceLoader.loadRules.called);
    t.true(t.context.rule.create.calledTwice);
    t.true(t.context.eventemitter.prototype.on.calledTwice);
    t.is(t.context.eventemitter.prototype.on.args[0][0], 'fetch::end');
    t.is(t.context.eventemitter.prototype.on.args[1][0], 'fetch::error');

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If config.rules is an array and has some rules "off", we shouldn't create those rules`, (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', rule],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });

    new Sonarwhal({
        connector: 'connector',
        rules: [
            'disallowed-headers:warning',
            '-manifest-exists'
        ]
    });

    t.true(t.context.resourceLoader.loadRules.called);
    t.true(t.context.rule.create.calledOnce);

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If a rule has the metadata "ignoredConnectors" set up, we shouldn't ignore those rules if the connector isn't in that property`, (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: { ignoredConnectors: ['chrome'] }
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', rule],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create')
        .onFirstCall()
        .returns({ 'fetch::end': () => { } })
        .onSecondCall()
        .returns({ 'fetch::error': () => { } });

    new Sonarwhal({
        connector: 'jsdom',
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        }
    });

    t.true(t.context.resourceLoader.loadRules.called);
    t.true(t.context.rule.create.calledTwice);
    t.true(t.context.eventemitter.prototype.on.calledTwice);
    t.is(t.context.eventemitter.prototype.on.args[0][0], 'fetch::end');
    t.is(t.context.eventemitter.prototype.on.args[1][0], 'fetch::error');

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If a rule has the metadata "ignoredConnectors" set up, we should ignore those rules if the connector is in that property`, (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };
    const ruleWithIgnoredConnector = {
        create() {
            return {};
        },
        meta: { ignoredConnectors: ['chrome'] }
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    t.context.ruleWithIgnoredConnector = ruleWithIgnoredConnector;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', ruleWithIgnoredConnector],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });
    sinon.spy(ruleWithIgnoredConnector, 'create');
    new Sonarwhal({
        connector: 'chrome',
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        }
    });

    t.true(t.context.resourceLoader.loadRules.called);
    t.false(t.context.ruleWithIgnoredConnector.create.called);
    t.true(t.context.rule.create.calledOnce);

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If the rule scope is 'local' and the connector isn't local the rule should be ignored`, (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };
    const ruleWithScopeLocal = {
        create() {
            return {};
        },
        meta: { scope: Scope.local }
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    t.context.ruleWithScopeLocal = ruleWithScopeLocal;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', ruleWithScopeLocal],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });
    sinon.spy(ruleWithScopeLocal, 'create');
    new Sonarwhal({
        connector: 'chrome',
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        }
    });

    t.true(t.context.resourceLoader.loadRules.called);
    t.false(t.context.ruleWithScopeLocal.create.called);
    t.true(t.context.rule.create.calledOnce);

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If the rule scope is 'site' and the connector is local the rule should be ignored`, (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };
    const ruleWithScopeSite = {
        create() {
            return {};
        },
        meta: { scope: Scope.site }
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    t.context.ruleWithScopeSite = ruleWithScopeSite;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', ruleWithScopeSite],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });
    sinon.spy(ruleWithScopeSite, 'create');
    new Sonarwhal({
        connector: 'local',
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        }
    });

    t.true(t.context.resourceLoader.loadRules.called);
    t.false(t.context.ruleWithScopeSite.create.called);
    t.true(t.context.rule.create.calledOnce);

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If the rule scope is 'any' and the connector is local the rule should be used`, (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };
    const ruleWithScopeSite = {
        create() {
            return {};
        },
        meta: { scope: Scope.any }
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    t.context.ruleWithScopeSite = ruleWithScopeSite;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', ruleWithScopeSite],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });
    sinon.spy(ruleWithScopeSite, 'create');
    new Sonarwhal({
        connector: 'local',
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        }
    });

    t.true(t.context.resourceLoader.loadRules.called);
    t.true(t.context.ruleWithScopeSite.create.called);
    t.true(t.context.rule.create.calledOnce);

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If the rule scope is 'any' and the connector isn't local the rule should be used`, (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };
    const ruleWithScopeSite = {
        create() {
            return {};
        },
        meta: { scope: Scope.any }
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    t.context.ruleWithScopeSite = ruleWithScopeSite;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', ruleWithScopeSite],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });
    sinon.spy(ruleWithScopeSite, 'create');
    new Sonarwhal({
        connector: 'jsdom',
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        }
    });

    t.true(t.context.resourceLoader.loadRules.called);
    t.true(t.context.ruleWithScopeSite.create.called);
    t.true(t.context.rule.create.calledOnce);

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If an event is emitted for an ignored url, it shouldn't propagate`, async (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };

    t.context.rule = rule;
    sinon.spy(eventEmitter.EventEmitter2.prototype, 'emitAsync');
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });

    const sonarwhalObject = new Sonarwhal({
        connector: 'connector',
        ignoredUrls: [{
            domain: '.*\\.domain1\.com/.*', // eslint-disable-line no-useless-escape
            rules: ['*']
        }],
        rules: { 'disallowed-headers': 'warning' }
    });

    await sonarwhalObject.emitAsync('event', { resource: 'http://www.domain1.com/test' });

    t.false(t.context.eventemitter.prototype.emitAsync.called);

    t.context.eventemitter.prototype.emitAsync.restore();
});

test.serial(`If a rule is ignoring some url, it shouldn't run the event`, (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });

    new Sonarwhal({
        connector: 'connector',
        ignoredUrls: [{
            domain: '.*\\.domain1\.com/.*', // eslint-disable-line no-useless-escape
            rules: ['disallowed-headers']
        }, {
            domain: '.*\\.domain2\.com/.*', // eslint-disable-line no-useless-escape
            rules: ['disallowed-headers']
        }],
        rules: { 'disallowed-headers': 'warning' }
    });

    const eventHandler = t.context.eventemitter.prototype.on.args[0][1];

    t.is(eventHandler({ resource: 'http://www.domain1.com/test' }), null);

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If a rule is taking too much time, it should be ignored after the configured timeout`, async (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', rule]
    ]));
    sinon.stub(rule, 'create').returns({
        'fetch::end': async () => {
            await delay(5000);

            return 'finish';
        }
    });

    new Sonarwhal({
        connector: 'connector',
        rules: { 'disallowed-headers': 'warning' },
        rulesTimeout: 1000
    });

    const eventHandler = t.context.eventemitter.prototype.on.args[0][1];

    t.is(await eventHandler({ resource: 'http://www.test.com/' }), null);

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If connectorId doesn't exist, it should throw an error`, (t) => {
    sinon.stub(t.context.resourceLoader, 'loadConnector').returns(null);

    try {
        new Sonarwhal({ connector: 'invalidConnector' });

        t.false(true);
    } catch (err) {
        t.is(err.message, 'Connector "invalidConnector" not found');
    }
});

test.serial('If connectorId is valid, we should init the connector', (t) => {
    t.context.connectorFunction = () => { };

    sinon.stub(t.context, 'connectorFunction').returns({});
    sinon.stub(t.context.resourceLoader, 'loadConnector').returns(t.context.connectorFunction);

    new Sonarwhal({ connector: 'myconnector' });

    t.true(t.context.connectorFunction.called);
});

test.serial('If connector is an object with valid data, we should init the connector', (t) => {
    t.context.connectorFunction = () => { };

    sinon.stub(t.context, 'connectorFunction').returns({});
    sinon.stub(t.context.resourceLoader, 'loadConnector').returns(t.context.connectorFunction);

    new Sonarwhal({
        connector: {
            name: 'myconnector',
            options: {}
        }
    });

    t.true(t.context.connectorFunction.called);
});

test.serial('formatter should return the formatter configured', (t) => {
    const sonarwhalObject = new Sonarwhal({
        connector: 'connector',
        formatters: ['formatter']
    });

    t.is(sonarwhalObject.formatters[0], 'formatter');
});

test.serial('pageContent should return the HTML', async (t) => {
    const html = '<html></html>';

    t.context.connectorFunction = () => { };
    sinon.stub(t.context, 'connectorFunction').returns({ html });
    sinon.stub(t.context.resourceLoader, 'loadConnector').returns(t.context.connectorFunction);

    const sonarwhalObject = new Sonarwhal({
        connector: {
            name: 'myconnector',
            options: {}
        }
    });

    t.is(await sonarwhalObject.pageContent, html);
});

test.serial(`pageHeaders should return the page's response headers`, (t) => {
    const headers = { header1: 'value1' };

    t.context.connectorFunction = () => { };
    sinon.stub(t.context, 'connectorFunction').returns({ headers });
    sinon.stub(t.context.resourceLoader, 'loadConnector').returns(t.context.connectorFunction);

    const sonarwhalObject = new Sonarwhal({
        connector: {
            name: 'myconnector',
            options: {}
        }
    });

    t.is(sonarwhalObject.pageHeaders, headers);
});

test.serial('If connector.collect fails, it should return an error', async (t) => {
    t.context.collect = () => {
        throw new Error('Error runing collect');
    };
    t.context.connectorFunction = () => { };
    sinon.stub(t.context, 'connectorFunction').returns({ collect: t.context.collect });
    sinon.stub(t.context.resourceLoader, 'loadConnector').returns(t.context.connectorFunction);

    const sonarwhalObject = new Sonarwhal({
        connector: {
            name: 'myconnector',
            options: {}
        }
    });

    const localUrl = new url.URL('http://localhost/');

    try {
        await sonarwhalObject.executeOn(localUrl);
        t.false(true);
    } catch (err) {
        t.is(err.message, 'Error runing collect');
    }
});

test.serial('executeOn should return all messages', async (t) => {
    t.context.collect = () => { };
    t.context.connectorFunction = () => { };
    sinon.stub(t.context, 'connectorFunction').returns({ collect: t.context.collect });
    sinon.stub(t.context.resourceLoader, 'loadConnector').returns(t.context.connectorFunction);

    const sonarwhalObject = new Sonarwhal({
        connector: {
            name: 'myconnector',
            options: {}
        }
    });

    const localUrl = new url.URL('http://localhost/');

    sonarwhalObject.report('1', 1, 'node', { column: 1, line: 1 }, 'message', 'resource');
    sonarwhalObject.report('2', 1, 'node', { column: 1, line: 2 }, 'message2', 'resource2');

    const result = await sonarwhalObject.executeOn(localUrl);

    t.is(result.length, 2);
});
