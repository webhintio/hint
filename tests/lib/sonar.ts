import * as url from 'url';

import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import test from 'ava';

import { delay } from '../../src/lib/utils/misc';

const resourceLoader = {
    getCollectors() { },
    getPlugins() { },
    getRules() { }
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

import * as sonar from '../../src/lib/sonar';

test.beforeEach((t) => {
    t.context.resourceLoader = resourceLoader;
    t.context.eventemitter = eventEmitter.EventEmitter2;
});

test.afterEach.always((t) => {
    if (t.context.resourceLoader.getPlugins.restore) {
        t.context.resourceLoader.getPlugins.restore();
    }
    if (t.context.resourceLoader.getRules.restore) {
        t.context.resourceLoader.getRules.restore();
    }
    if (t.context.resourceLoader.getCollectors.restore) {
        t.context.resourceLoader.getCollectors.restore();
    }
});

test(`If config is an empty object, we shouldn't throw an error`, (t) => {
    t.throws(() => {
        const sonarObject = new sonar.Sonar({}); //eslint-disable-line no-unused-vars
    }, Error);
});

test(`If config doesn't have any rule nor plugins, we shouldn't create any plugin nor rules`, (t) => {
    sinon.spy(t.context.resourceLoader, 'getPlugins');
    sinon.spy(t.context.resourceLoader, 'getRules');

    const sonarObject = new sonar.Sonar({ collector: 'collector' }); //eslint-disable-line no-unused-vars

    t.false(t.context.resourceLoader.getPlugins.called);
    t.false(t.context.resourceLoader.getRules.called);
});

test(`If config.browserslist is an string, we should initilize the property targetedBrowsers`, (t) => {
    sinon.spy(t.context.resourceLoader, 'getPlugins');
    sinon.spy(t.context.resourceLoader, 'getRules');

    const sonarObject = new sonar.Sonar({
        browserslist: '> 5%',
        collector: 'collector'
    }); //eslint-disable-line no-unused-vars

    t.true(sonarObject.targetedBrowsers.length > 0);

    t.false(t.context.resourceLoader.getPlugins.called);
    t.false(t.context.resourceLoader.getRules.called);
});

test.serial('If config.plugins is an array we should create just those plugins', (t) => {
    const plugin = {
        create() {
            return {};
        }
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.plugin = plugin;
    sinon.stub(t.context.resourceLoader, 'getPlugins').returns(new Map([
        ['plugin1Name', plugin],
        ['plugin2Name', plugin],
        ['plubin3Name', plugin]
    ]));
    sinon.stub(plugin, 'create')
        .onFirstCall()
        .returns({ 'fetch::end': () => { } })
        .onSecondCall()
        .returns({
            'fetch::end': () => { },
            'fetch::error': () => { }
        });

    const sonarObject = new sonar.Sonar({ collector: 'collector', plugins: ['plugin1Name', 'plugin2Name'] }); //eslint-disable-line no-unused-vars

    t.true(t.context.resourceLoader.getPlugins.called);
    t.is(t.context.plugin.create.callCount, 2);
    t.is(t.context.eventemitter.prototype.on.callCount, 3);
    t.is(t.context.eventemitter.prototype.on.args[0][0], 'fetch::end');
    t.is(t.context.eventemitter.prototype.on.args[1][0], 'fetch::end');
    t.is(t.context.eventemitter.prototype.on.args[2][0], 'fetch::error');

    t.context.eventemitter.prototype.on.restore();
});

test.serial('If config.rules is an object with rules, we should create just those rules', (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    sinon.stub(t.context.resourceLoader, 'getRules').returns(new Map([
        ['disallowed-headers', rule],
        ['lang-attribute', rule],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create')
        .onFirstCall()
        .returns({ 'fetch::end': () => { } })
        .onSecondCall()
        .returns({ 'fetch::error': () => { } });

    const sonarObject = new sonar.Sonar({ //eslint-disable-line no-unused-vars
        collector: 'collector',
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        }
    });

    t.true(t.context.resourceLoader.getRules.called);
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
    sinon.stub(t.context.resourceLoader, 'getRules').returns(new Map([
        ['disallowed-headers', rule],
        ['lang-attribute', rule],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });

    const sonarObject = new sonar.Sonar({ //eslint-disable-line no-unused-vars
        collector: 'collector',
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'off'
        }
    });

    t.true(t.context.resourceLoader.getRules.called);
    t.true(t.context.rule.create.calledOnce);

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If a rule has the metadata "ignoredCollectors" set up, we shouldn't ignore those rules if the collector isn't in that property`, (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: { ignoredCollectors: ['cdp'] }
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    sinon.stub(t.context.resourceLoader, 'getRules').returns(new Map([
        ['disallowed-headers', rule],
        ['lang-attribute', rule],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create')
        .onFirstCall()
        .returns({ 'fetch::end': () => { } })
        .onSecondCall()
        .returns({ 'fetch::error': () => { } });

    const sonarObject = new sonar.Sonar({ //eslint-disable-line no-unused-vars
        collector: 'jsdom',
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        }
    });

    t.true(t.context.resourceLoader.getRules.called);
    t.true(t.context.rule.create.calledTwice);
    t.true(t.context.eventemitter.prototype.on.calledTwice);
    t.is(t.context.eventemitter.prototype.on.args[0][0], 'fetch::end');
    t.is(t.context.eventemitter.prototype.on.args[1][0], 'fetch::error');

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If a rule has the metadata "ignoredCollectors" set up, we should ignore those rules if the collector is in that property`, (t) => {
    const rule = {
        create() {
            return {};
        },
        meta: {}
    };
    const ruleWithIgnoredCollector = {
        create() {
            return {};
        },
        meta: { ignoredCollectors: ['cdp'] }
    };

    sinon.spy(eventEmitter.EventEmitter2.prototype, 'on');
    t.context.rule = rule;
    t.context.ruleWithIgnoredCollector = ruleWithIgnoredCollector;
    sinon.stub(t.context.resourceLoader, 'getRules').returns(new Map([
        ['disallowed-headers', ruleWithIgnoredCollector],
        ['lang-attribute', rule],
        ['manifest-exists', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });
    sinon.spy(ruleWithIgnoredCollector, 'create');
    const sonarObject = new sonar.Sonar({ //eslint-disable-line no-unused-vars
        collector: 'cdp',
        rules: {
            'disallowed-headers': 'warning',
            'manifest-exists': 'warning'
        }
    });

    t.true(t.context.resourceLoader.getRules.called);
    t.false(t.context.ruleWithIgnoredCollector.create.called);
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
    sinon.stub(t.context.resourceLoader, 'getRules').returns(new Map([
        ['disallowed-headers', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });

    const sonarObject = new sonar.Sonar({ //eslint-disable-line no-unused-vars
        collector: 'collector',
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
    sinon.stub(t.context.resourceLoader, 'getRules').returns(new Map([
        ['disallowed-headers', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });

    const sonarObject = new sonar.Sonar({ //eslint-disable-line no-unused-vars
        collector: 'collector',
        ignoredUrls: { '.*\\.domain1\.com/.*': ['*'] }, //eslint-disable-line no-useless-escape
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
    sinon.stub(t.context.resourceLoader, 'getRules').returns(new Map([
        ['disallowed-headers', rule]
    ]));
    sinon.stub(rule, 'create').returns({ 'fetch::end': () => { } });

    const sonarObject = new sonar.Sonar({ //eslint-disable-line no-unused-vars
        collector: 'collector',
        ignoredUrls: { '.*\\.domain1\.com/.*': ['disallowed-headers'], '.*\\.domain2\.com/.*': ['disallowed-headers'] }, //eslint-disable-line no-useless-escape
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
    sinon.stub(t.context.resourceLoader, 'getRules').returns(new Map([
        ['disallowed-headers', rule]
    ]));
    sinon.stub(rule, 'create').returns({
        'fetch::end': async () => {
            await delay(5000);

            return 'finish';
        }
    });

    const sonarObject = new sonar.Sonar({ //eslint-disable-line no-unused-vars
        collector: 'collector',
        rules: { 'disallowed-headers': 'warning' },
        rulesTimeout: 1000
    });

    const eventHandler = t.context.eventemitter.prototype.on.args[0][1];

    t.is(await eventHandler({ resource: 'http://www.test.com/' }), null);

    t.context.eventemitter.prototype.on.restore();
});

test.serial(`If collectorId doesn't exist, it should throw an error`, async (t) => {
    sinon.stub(t.context.resourceLoader, 'getCollectors').returns(new Map());

    try {
        await sonar.create({ collector: 'invalidCollector' });
        t.false(true);
    } catch (err) {
        t.is(err.message, 'Collector "invalidCollector" not found');
    }
});

test.serial('If collectorId is valid, we should init the collector', async (t) => {
    t.context.collectorFunction = () => { };

    sinon.stub(t.context, 'collectorFunction').returns({});
    sinon.stub(t.context.resourceLoader, 'getCollectors').returns(new Map([
        ['mycollector', t.context.collectorFunction]
    ]));

    await sonar.create({ collector: 'mycollector' });

    t.true(t.context.collectorFunction.called);
});

test.serial('If collector is an object with valid data, we should init the collector', async (t) => {
    t.context.collectorFunction = () => { };

    sinon.stub(t.context, 'collectorFunction').returns({});
    sinon.stub(t.context.resourceLoader, 'getCollectors').returns(new Map([
        ['mycollector', t.context.collectorFunction]
    ]));

    await sonar.create({
        collector: {
            name: 'mycollector',
            options: {}
        }
    });

    t.true(t.context.collectorFunction.called);
});

test.serial('formatter should return the formatter configured', (t) => {
    const sonarObject = new sonar.Sonar({
        collector: 'collector',
        formatter: 'formatter'
    });

    t.is(sonarObject.formatter, 'formatter');
});

test.serial('pageContent should return the HTML', async (t) => {
    const html = '<html></html>';

    t.context.collectorFunction = () => { };
    sinon.stub(t.context, 'collectorFunction').returns({ html });
    sinon.stub(t.context.resourceLoader, 'getCollectors').returns(new Map([
        ['mycollector', t.context.collectorFunction]
    ]));

    const sonarObject = await sonar.create({
        collector: {
            name: 'mycollector',
            options: {}
        }
    });

    t.is(await sonarObject.pageContent, html);
});

test.serial(`pageHeaders should return the page's response headers`, async (t) => {
    const headers = { header1: 'value1' };

    t.context.collectorFunction = () => { };
    sinon.stub(t.context, 'collectorFunction').returns({ headers });
    sinon.stub(t.context.resourceLoader, 'getCollectors').returns(new Map([
        ['mycollector', t.context.collectorFunction]
    ]));

    const sonarObject = await sonar.create({
        collector: {
            name: 'mycollector',
            options: {}
        }
    });

    t.is(sonarObject.pageHeaders, headers);
});

test.serial('If collector.collect fails, it should return an error', async (t) => {
    t.context.collect = () => {
        throw new Error('Error runing collect');
    };
    t.context.collectorFunction = () => { };
    sinon.stub(t.context, 'collectorFunction').returns({ collect: t.context.collect });
    sinon.stub(t.context.resourceLoader, 'getCollectors').returns(new Map([
        ['mycollector', t.context.collectorFunction]
    ]));

    const sonarObject = await sonar.create({
        collector: {
            name: 'mycollector',
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
    t.context.collectorFunction = () => { };
    sinon.stub(t.context, 'collectorFunction').returns({ collect: t.context.collect });
    sinon.stub(t.context.resourceLoader, 'getCollectors').returns(new Map([
        ['mycollector', t.context.collectorFunction]
    ]));

    const sonarObject = await sonar.create({
        collector: {
            name: 'mycollector',
            options: {}
        }
    });

    const localUrl = new url.URL('http://localhost/');

    sonarObject.report('1', 1, 'node', { column: 1, line: 1 }, 'message', 'resource');
    sonarObject.report('2', 1, 'node', { column: 1, line: 2 }, 'message2', 'resource2');

    const result = await sonarObject.executeOn(localUrl);

    t.is(result.length, 2);
});
