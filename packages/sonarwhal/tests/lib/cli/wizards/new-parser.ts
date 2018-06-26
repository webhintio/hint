/* eslint-disable */
import * as path from 'path';

import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

const fsExtra = { copy() { } };
const inquirer = { prompt() { } };
const isOfficial = { default() { } };
const normalizeStringByDelimiter = { default() { } };
const readFileAsync = { default() { } };
const writeFileAsync = { default() { } };

const handlebars = {
    compileTemplate() { },
    escapeSafeString() { }
};
const mkdirp = (dir, callback) => {
    callback();
};

proxyquire('../../../../src/lib/cli/wizards/new-parser', {
    '../../utils/handlebars': handlebars,
    '../../utils/packages/is-official': isOfficial,
    '../../utils/misc/normalize-string-by-delimeter': normalizeStringByDelimiter,
    '../../utils/fs/read-file-async': readFileAsync,
    '../../utils/fs/write-file-async': writeFileAsync,
    'fs-extra': fsExtra,
    inquirer,
    mkdirp
});

import newParser from '../../../../src/lib/cli/wizards/new-parser';

test.beforeEach((t) => {
    sinon.stub(fsExtra, 'copy').resolves();
    sinon.stub(writeFileAsync, 'default').resolves();
    sinon.stub(normalizeStringByDelimiter, 'default').returns('');
    sinon.stub(readFileAsync, 'default').resolves('');
    sinon.stub(handlebars, 'compileTemplate').returns('');

    t.context.fs = fsExtra;
    t.context.misc = {
        normalizeStringByDelimiter,
        readFileAsync,
        writeFileAsync
    };
    t.context.handlebars = handlebars;
});

test.afterEach.always((t) => {
    t.context.fs.copy.restore();
    t.context.misc.writeFileAsync.default.restore();
    t.context.misc.normalizeStringByDelimiter.default.restore();
    t.context.misc.readFileAsync.default.restore();
    t.context.handlebars.compileTemplate.restore();
});

test.serial('It should create a new official parser.', async (t) => {
    const parserInfoResult = {
        description: 'description',
        name: 'name'
    };
    const parserEventsResult = {
        again: false,
        event: 'fetch::end::*'
    };
    const sandbox = sinon.createSandbox();

    const packageRoot = path.join(__dirname, '../../../../../');

    sandbox.stub(isOfficial, 'default').resolves(true);
    sandbox.stub(process, 'cwd').returns(packageRoot);
    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(parserInfoResult)
        .onSecondCall()
        .resolves(parserEventsResult);

    const result = await newParser();

    // 6 files (2 code + test + doc + tsconfig.json + package.json)
    t.is(t.context.handlebars.compileTemplate.callCount, 6, `Handlebars doesn't complile the right number of files`);
    // 6 files (2 code + test + doc + tsconfig.json + package.json)
    t.is(t.context.misc.writeFileAsync.default.callCount, 6, 'Invalid number of files created');

    t.true(result);
    t.true(t.context.fs.copy.calledOnce);

    sandbox.restore();
});

test.serial('It should create a new official parser with no duplicate events.', async (t) => {
    const parserInfoResult = {
        description: 'description',
        name: 'name'
    };
    const parserEventsResult1 = {
        again: true,
        event: 'fetch::end::*'
    };
    const parserEventsResult2 = {
        again: true,
        element: 'div',
        event: 'element::'
    };
    const parserEventsResult3 = {
        again: false,
        element: 'script',
        event: 'element::'
    };
    const sandbox = sinon.createSandbox();
    const packageRoot = path.join(__dirname, '../../../../../');

    sandbox.stub(isOfficial, 'default').resolves(true);
    sandbox.stub(process, 'cwd').returns(packageRoot);
    sandbox.stub(inquirer, 'prompt')
        .onCall(0)
        .resolves(parserInfoResult)
        .onCall(1)
        .resolves(parserEventsResult1)
        .onCall(2)
        .resolves(parserEventsResult2)
        .onCall(3)
        .resolves(parserEventsResult3);

    t.context.inquirer = inquirer;

    const result = await newParser();
    const questions = t.context.inquirer.prompt.args[3][0];
    const eventQuestion = questions.find((question) => {
        return question.name === 'event';
    });
    const eventList = eventQuestion.choices;
    const containFetchEnd = eventList.includes('fetch::end::*');
    const containElement = eventList.includes('element::');
    const data = t.context.handlebars.compileTemplate.args[0][1];
    const events = data.events.map((event) => {
        return event.event;
    });
    const eventsSet = new Set(events);

    // 6 files (2 code + test + doc + tsconfig.json + package.json)
    t.is(t.context.handlebars.compileTemplate.callCount, 6, `Handlebars doesn't complile the right number of files`);
    // 6 files (2 code + test + doc + tsconfig.json + package.json)
    t.is(t.context.misc.writeFileAsync.default.callCount, 6, 'Invalid number of files created');

    t.false(containFetchEnd);
    t.true(containElement);

    t.is(events.length, eventsSet.size);

    t.true(result);
    t.true(t.context.fs.copy.calledOnce);

    sandbox.restore();
});

test.serial('It should create a new non-official parser.', async (t) => {
    const parserInfoResult = {
        description: 'description',
        name: 'name'
    };
    const parserEventsResult = {
        again: false,
        event: 'fetch::end::*'
    };
    const sandbox = sinon.createSandbox();

    sandbox.stub(isOfficial, 'default').resolves(false);
    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(parserInfoResult)
        .onSecondCall()
        .resolves(parserEventsResult);

    const result = await newParser();

    // 7 files (2 code + test + doc + tsconfig.json + package.json + .sonarwhalrc)
    t.is(t.context.handlebars.compileTemplate.callCount, 7, `Handlebars doesn't complile the right number of files`);
    // 7 files (2 code + test + doc + tsconfig.json + package.json + .sonarwhalrc)
    t.is(t.context.misc.writeFileAsync.default.callCount, 7, 'Invalid number of files created');

    t.true(result);
    t.true(t.context.fs.copy.calledTwice);

    sandbox.restore();
});
