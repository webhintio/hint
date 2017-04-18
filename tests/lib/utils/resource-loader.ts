import * as path from 'path';

import test from 'ava';
import * as sinon from 'sinon';
import * as globby from 'globby';
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

test.serial(`'resource-loader' should throw and exception if there is more than one collector with the same name`, (t) => {
    t.throws(() => {
        /* `proxyquire` loads the module automatically so we just
         *  need to check if `proxyquire` throws an exception. */
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

['collector', 'formatter', 'rule', 'plugin'].forEach((e) => {
    const functionName = `get${e.charAt(0).toUpperCase()}${e.slice(1)}s`;

    test(`'${functionName}' should return all ${e}s`, (t) => {
        const entities = resourceLoader[functionName]();
        const files = getResourceFiles(e);

        t.is(entities.size, files.length);
    });
});
