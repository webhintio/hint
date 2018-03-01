import * as path from 'path';
import * as stream from 'stream';

import test from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

import { delay } from '../../../src/lib/utils/misc';

const npm = {
    load(sync, cb) {
        cb();
    }
};
const fs = { existsSync() { } };
const child = { spawnSync() { } };
const logger = {
    error() { },
    log() { }
};

const esearchContainer = { esearch() { } };

proxyquire('../../../src/lib/utils/npm', {
    './logging': logger,
    child_process: child, // eslint-disable-line camelcase
    fs,
    npm,
    'npm/lib/search/esearch': esearchContainer.esearch
});

test.serial('installPackages should run the right command if package.json exists', (t) => {
    const sandbox = sinon.createSandbox();
    const npmUtils = require('../../../src/lib/utils/npm');

    sandbox.stub(child, 'spawnSync').returns({ status: 0 });
    sandbox.stub(fs, 'existsSync').returns(true);
    npmUtils.installPackages(['@sonarwhal/rule-rule1', '@sonarwhal/formatter-formatter1']);

    t.context.child = child;

    t.is(t.context.child.spawnSync.args[0][0], 'npm install @sonarwhal/rule-rule1 @sonarwhal/formatter-formatter1'); // eslint-disable-line no-sync

    sandbox.restore();
});

test.serial(`installPackages should run the right command if package.json doesn't exist`, (t) => {
    const sandbox = sinon.createSandbox();
    const npmUtils = require('../../../src/lib/utils/npm');

    sandbox.stub(child, 'spawnSync').returns({ status: 0 });
    sandbox.stub(fs, 'existsSync').returns(false);

    npmUtils.installPackages(['@sonarwhal/rule-rule1', '@sonarwhal/formatter-formatter1']);

    t.context.child = child;

    t.is(t.context.child.spawnSync.args[0][0], 'npm install @sonarwhal/rule-rule1 @sonarwhal/formatter-formatter1 -g'); // eslint-disable-line no-sync

    sandbox.restore();
});

test.serial('installPackages should show the command to run if the installation fail and package.json exists', (t) => {
    const sandbox = sinon.createSandbox();
    const npmUtils = require('../../../src/lib/utils/npm');

    sandbox.stub(child, 'spawnSync').returns({
        output: [null, null, Buffer.from('Error installing packages')],
        status: 1
    });
    sandbox.stub(fs, 'existsSync').returns(true);
    sandbox.spy(logger, 'log');

    npmUtils.installPackages(['@sonarwhal/rule-rule1', '@sonarwhal/formatter-formatter1']);

    t.context.child = child;

    t.true(t.context.child.spawnSync.args[0][0].includes('npm install @sonarwhal/rule-rule1 @sonarwhal/formatter-formatter1')); // eslint-disable-line no-sync
    t.false(t.context.child.spawnSync.args[0][0].includes('npm install @sonarwhal/rule-rule1 @sonarwhal/formatter-formatter1 -g')); // eslint-disable-line no-sync

    sandbox.restore();
});

test.serial(`installPackages should show the command to run if the installation fail and package.json doesn't exist`, (t) => {
    const sandbox = sinon.createSandbox();
    const npmUtils = require('../../../src/lib/utils/npm');

    sandbox.stub(child, 'spawnSync').returns({
        output: [null, null, Buffer.from('Error installing packages')],
        status: 1
    });
    sandbox.stub(fs, 'existsSync').returns(false);
    sandbox.spy(logger, 'log');

    npmUtils.installPackages(['@sonarwhal/rule-rule1', '@sonarwhal/formatter-formatter1']);

    t.context.child = child;

    t.true(t.context.child.spawnSync.args[0][0].includes('npm install @sonarwhal/rule-rule1 @sonarwhal/formatter-formatter1 -g')); // eslint-disable-line no-sync

    sandbox.restore();
});

test.serial('search should search for the right data', async (t) => {
    const sandbox = sinon.createSandbox();
    const mockedStream = new stream.Writable();

    sandbox.stub(esearchContainer, 'esearch').returns(mockedStream);

    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/npm.js')];

    proxyquire('../../../src/lib/utils/npm', {
        './logging': logger,
        child_process: child, // eslint-disable-line camelcase
        fs,
        npm,
        'npm/lib/search/esearch': esearchContainer.esearch
    });

    const npmUtils = require('../../../src/lib/utils/npm');

    t.context.esearchContainer = esearchContainer;

    const promise = npmUtils.search('sonarwhal-rule');

    await delay(500);
    mockedStream.emit('end');

    await promise;

    const options = t.context.esearchContainer.esearch.args[0][0];

    t.is(options.include[0], 'sonarwhal-rule');
    t.is(options.include.length, 1);

    sandbox.restore();
});

test.serial('search should fail if something goes wrong', async (t) => {
    const sandbox = sinon.createSandbox();
    const mockedStream = new stream.Writable();

    sandbox.stub(esearchContainer, 'esearch').returns(mockedStream);

    delete require.cache[path.resolve(__dirname, '../../../src/lib/utils/npm.js')];

    proxyquire('../../../src/lib/utils/npm', {
        './logging': logger,
        child_process: child, // eslint-disable-line camelcase
        fs,
        npm,
        'npm/lib/search/esearch': esearchContainer.esearch
    });

    const npmUtils = require('../../../src/lib/utils/npm');

    t.context.esearchContainer = esearchContainer;

    const promise = npmUtils.search('sonarwhal-rule');

    await delay(500);
    mockedStream.emit('error', new Error('Error searching'));

    t.plan(1);
    try {
        await promise;
    } catch (err) {
        t.is(err.message, 'Error searching');
    }

    sandbox.restore();
});
