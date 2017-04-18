import test from 'ava';
import * as sinon from 'sinon';
import * as globby from 'globby';
import * as path from 'path';

import * as proxyquire from 'proxyquire';

import * as resourceLoader from '../../../src/lib/utils/resource-loader';

const fakeGlobby = { sync() { } };

test.beforeEach((t) => {
    t.context.fakeGlobby = fakeGlobby;
    sinon.stub(fakeGlobby, 'sync').returns(['src/lib/collectors/cdp/cdp.js', 'src/lib/collectors/cdp2/cdp.js']);
});

test.afterEach((t) => {
    t.context.fakeGlobby.sync.restore();
});

test.serial('resource-loader should throw and exception if there are more than one collector with the same name', (t) => {
    t.throws(() => {
        /* proxyquire load the module automatically, so we just need to check that
         * proxyquire throw an execption */
        proxyquire('../../../src/lib/utils/resource-loader', { globby: fakeGlobby });
    }, Error);
});

const getResourceFiles = (type) => {
    const currentResources = globby.sync(`{./,./node_modules/sonar-*}dist/src/lib/${type}s/**/*.js`);

    return currentResources.filter((resourceFile) => {
        const resourceName = path.basename(resourceFile, '.js');

        return path.dirname(resourceFile).includes(resourceName);
    });
};

test('getCollectors should return all collectors', (t) => {
    const collectors = resourceLoader.getCollectors();
    const currentCollectors = getResourceFiles('collector');

    t.is(collectors.size, currentCollectors.length);
});

test('getFormatters should return all formatters', (t) => {
    const formatters = resourceLoader.getFormatters();
    const currentFormatters = getResourceFiles('formatter');

    t.is(formatters.size, currentFormatters.length);
});

test('getRules should return all rules', (t) => {
    const rules = resourceLoader.getRules();
    const currentRules = getResourceFiles('rule');

    t.is(rules.size, currentRules.length);
});

test('getPlugins should return all plugins', (t) => {
    const plugins = resourceLoader.getPlugins();
    const currentPlugins = getResourceFiles('plugin');

    t.is(plugins.size, currentPlugins.length);
});