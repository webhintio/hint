import * as url from 'url';

import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import test from 'ava';

import { delay } from '../../src/lib/utils/misc';

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

proxyquire('../../src/lib/sonar', {
    './utils/resource-loader': resourceLoader,
    eventemitter2: eventEmitter
});

import { Sonar } from '../../src/lib/sonar';

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
        const sonarObject = new Sonar(<any>{}); // eslint-disable-line no-unused-vars
    }, Error);
});

test(`If config doesn't have any rule, we shouldn't create any rules`, (t) => {
    sinon.spy(t.context.resourceLoader, 'loadRules');

    const sonarObject = new Sonar({ connector: 'connector' }); // eslint-disable-line no-unused-vars

    t.false(t.context.resourceLoader.loadRules.called);
});

test(`If the config object is invalid, we should throw an error`, (t) => {
    t.throws(() => {
        const sonarObject = new Sonar(<any>{ // eslint-disable-line no-unused-vars
            invalidProperty: 'invalid',
            randomProperty: 'random'
        });
    }, Error);
});

test(`If a rule config is invalid, we should throw an error`, (t) => {
    t.throws(() => {
        const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
            connector: 'connector',
            rules: { 'disallowed-headers': 'invalid-severity' }
        });
    }, Error);
});

test(`If a rule doesn't exist, we should throw an error`, (t) => {
    t.throws(() => {
        const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
            connector: 'connector',
            rules: { 'invalid-rule': 'error' }
        });
    }, Error);
});

test(`If config.browserslist is an string, we should initilize the property targetedBrowsers`, (t) => {
    sinon.spy(t.context.resourceLoader, 'loadRules');

    const sonarObject = new Sonar({
        browserslist: '> 5%',
        connector: 'connector'
    }); // eslint-disable-line no-unused-vars

    t.true(sonarObject.targetedBrowsers.length > 0);

    t.false(t.context.resourceLoader.loadRules.called);
});

// test.serial('If config.plugins is an array we should create just those plugins', (t) => {
//     const plugin = {
//         create() {
//             return {};
//         }
//     };

//     sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
//     t.context.plugin = plugin;
//     sinon.stub(t.context.resourceLoader, 'getPlugins').returns(new Map([
//         ['plugin1Name', plugin],
//         ['plugin2Name', plugin],
//         ['plubin3Name', plugin]
//     ]));
//     sinon.stub(plugin, 'create')
//         .onFirstCall()
//         .returns({ 'fetch::end': () => { } })
//         .onSecondCall()
//         .returns({
//             'fetch::end': () => { },
//             'fetch::error': () => { }
//         });

//     const sonarObject = new Sonar({ connector: 'connector', plugins: ['plugin1Name', 'plugin2Name'] }); //eslint-disable-line no-unused-vars

//     t.true(t.context.resourceLoader.getPlugins.called);
//     t.is(t.context.plugin.create.callCount, 2);
//     t.is(t.context.eventemitter.prototype.on.callCount, 3);
//     t.is(t.context.eventemitter.prototype.on.args[0][0], 'fetch::end');
//     t.is(t.context.eventemitter.prototype.on.args[1][0], 'fetch::end');
//     t.is(t.context.eventemitter.prototype.on.args[2][0], 'fetch::error');

//     t.context.eventemitter.prototype.on.restore();
// });

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

    const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
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

    const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
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

    const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
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

    const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
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

    const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
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

    const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
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
        meta: { ignoredConnectors: ['cdp'] }
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

    const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
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
        meta: { ignoredConnectors: ['cdp'] }
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
    const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
        connector: 'cdp',
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

test.serial(`If an event is emitted for a local file and the rule doesn't work with those then the handler should be null`, (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: { worksWithLocalFiles: false }
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    sinon.stub(t.context.resourceLoader, 'loadRules').returns(new Map([
        ['disallowed-headers', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });

    const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
        connector: 'connector',
        rules: { 'disallowed-headers': 'warning' }
    });

    const eventHandler = t.context.eventemitter.prototype.on.args[0][1];

    t.is(eventHandler({ resource: 'file://file.txt' }), null);

    t.context.eventemitter.prototype.on.restore();
});

test(`If an event is emitted for an ignored url, it shouldn't propagate`, async (t) => {
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

    const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
        connector: 'connector',
        ignoredUrls: { '.*\\.domain1\.com/.*': ['*'] }, // eslint-disable-line no-useless-escape
        rules: { 'disallowed-headers': 'warning' }
    });

    await sonarObject.emitAsync('event', { resource: 'http://www.domain1.com/test' });

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

    const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
        connector: 'connector',
        ignoredUrls: { '.*\\.domain1\.com/.*': ['disallowed-headers'], '.*\\.domain2\.com/.*': ['disallowed-headers'] }, // eslint-disable-line no-useless-escape
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

    const sonarObject = new Sonar({ // eslint-disable-line no-unused-vars
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
        const sonar = new Sonar({ connector: 'invalidConnector' }); // eslint-disable-line no-unused-vars

        t.false(true);
    } catch (err) {
        t.is(err.message, 'Connector "invalidConnector" not found');
    }
});

test.serial('If connectorId is valid, we should init the connector', (t) => {
    t.context.connectorFunction = () => { };

    sinon.stub(t.context, 'connectorFunction').returns({});
    sinon.stub(t.context.resourceLoader, 'loadConnector').returns(t.context.connectorFunction);

    const sonar = new Sonar({ connector: 'myconnector' }); // eslint-disable-line no-unused-vars

    t.true(t.context.connectorFunction.called);
});

test.serial('If connector is an object with valid data, we should init the connector', (t) => {
    t.context.connectorFunction = () => { };

    sinon.stub(t.context, 'connectorFunction').returns({});
    sinon.stub(t.context.resourceLoader, 'loadConnector').returns(t.context.connectorFunction);

    const sonar = new Sonar({ // eslint-disable-line no-unused-vars
        connector: {
            name: 'myconnector',
            options: {}
        }
    });

    t.true(t.context.connectorFunction.called);
});

test.serial('formatter should return the formatter configured', (t) => {
    const sonarObject = new Sonar({
        connector: 'connector',
        formatter: 'formatter'
    });

    t.is(sonarObject.formatter, 'formatter');
});

test.serial('pageContent should return the HTML', async (t) => {
    const html = '<html></html>';

    t.context.connectorFunction = () => { };
    sinon.stub(t.context, 'connectorFunction').returns({ html });
    sinon.stub(t.context.resourceLoader, 'loadConnector').returns(t.context.connectorFunction);

    const sonarObject = new Sonar({
        connector: {
            name: 'myconnector',
            options: {}
        }
    });

    t.is(await sonarObject.pageContent, html);
});

test.serial(`pageHeaders should return the page's response headers`, (t) => {
    const headers = { header1: 'value1' };

    t.context.connectorFunction = () => { };
    sinon.stub(t.context, 'connectorFunction').returns({ headers });
    sinon.stub(t.context.resourceLoader, 'loadConnector').returns(t.context.connectorFunction);

    const sonarObject = new Sonar({
        connector: {
            name: 'myconnector',
            options: {}
        }
    });

    t.is(sonarObject.pageHeaders, headers);
});

test.serial('If connector.collect fails, it should return an error', async (t) => {
    t.context.collect = () => {
        throw new Error('Error runing collect');
    };
    t.context.connectorFunction = () => { };
    sinon.stub(t.context, 'connectorFunction').returns({ collect: t.context.collect });
    sinon.stub(t.context.resourceLoader, 'loadConnector').returns(t.context.connectorFunction);

    const sonarObject = new Sonar({
        connector: {
            name: 'myconnector',
            options: {}
        }
    });

    const localUrl = new url.URL('http://localhost/');

    try {
        await sonarObject.executeOn(localUrl);
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

    const sonarObject = new Sonar({
        connector: {
            name: 'myconnector',
            options: {}
        }
    });

    const localUrl = new url.URL('http://localhost/');

    sonarObject.report('1', 1, 'node', { column: 1, line: 1 }, 'message', 'resource');
    sonarObject.report('2', 1, 'node', { column: 1, line: 2 }, 'message2', 'resource2');

    const result = await sonarObject.executeOn(localUrl);

    t.is(result.length, 2);
});
