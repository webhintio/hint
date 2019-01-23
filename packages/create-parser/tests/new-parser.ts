/* eslint-disable */
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface } from 'ava';
import * as InquirerTypes from 'inquirer';

import * as handlebarsUtils from '../src/handlebars-utils';

type NewParserContext = {
    sandbox: sinon.SinonSandbox;
    fsExtraCopyStub: sinon.SinonStub;
    normalizeStringByDelimiterDefaultStub: sinon.SinonStub;
    readFileAsyncDefaultStub: sinon.SinonStub;
    writeFileAsyncDefaultStub: sinon.SinonStub;
    handlebarsUtilsCompileTemplateStub: sinon.SinonStub;
};

const test = anyTest as TestInterface<NewParserContext>;

const fsExtra = { copy() { } };
const inquirer = { prompt(questions: InquirerTypes.Question[]) { } };
const isOfficial = { default() { } };
const normalizeStringByDelimiter = {
    default(): string {
        return '';
    }
};
const readFileAsync = { default() { } };
const writeFileAsync = { default() { } };

const mkdirp = (dir: string, callback: Function) => {
    callback();
};

proxyquire('../src/new-parser', {
    '../src/handlebars-utils': handlebarsUtils,
    'hint/dist/src/lib/utils/fs/read-file-async': readFileAsync,
    'hint/dist/src/lib/utils/fs/write-file-async': writeFileAsync,
    'hint/dist/src/lib/utils/misc/normalize-string-by-delimeter': normalizeStringByDelimiter,
    'hint/dist/src/lib/utils/packages/is-official': isOfficial,
    'fs-extra': fsExtra,
    inquirer,
    mkdirp
});

import newParser from '../src/new-parser';

test.beforeEach((t) => {
    const sandbox = sinon.createSandbox();

    t.context.fsExtraCopyStub = sandbox.stub(fsExtra, 'copy').resolves();
    t.context.writeFileAsyncDefaultStub = sandbox.stub(writeFileAsync, 'default').resolves();
    t.context.normalizeStringByDelimiterDefaultStub = sandbox.stub(normalizeStringByDelimiter, 'default').returns('');
    t.context.readFileAsyncDefaultStub = sandbox.stub(readFileAsync, 'default').resolves('');
    t.context.handlebarsUtilsCompileTemplateStub = sandbox.stub(handlebarsUtils, 'compileTemplate').resolves('');

    t.context.sandbox = sandbox;
});

test.afterEach.always((t) => {
    t.context.sandbox.restore();
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
    const sandbox = t.context.sandbox;

    sandbox.stub(isOfficial, 'default').resolves(true);
    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(parserInfoResult)
        .onSecondCall()
        .resolves(parserEventsResult);

    const result = await newParser();

    // 6 files (2 code + test + doc + tsconfig.json + package.json)
    t.is(t.context.handlebarsUtilsCompileTemplateStub.callCount, 6, `Handlebars doesn't complile the right number of files`);
    // 6 files (2 code + test + doc + tsconfig.json + package.json)
    t.is(t.context.writeFileAsyncDefaultStub.callCount, 6, 'Invalid number of files created');

    t.true(result);
    t.true(t.context.fsExtraCopyStub.calledOnce);
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
    const sandbox = t.context.sandbox;

    sandbox.stub(isOfficial, 'default').resolves(true);
    const inquirerPromptStub = sandbox.stub(inquirer, 'prompt')
        .onCall(0)
        .resolves(parserInfoResult)
        .onCall(1)
        .resolves(parserEventsResult1)
        .onCall(2)
        .resolves(parserEventsResult2)
        .onCall(3)
        .resolves(parserEventsResult3);

    const result = await newParser();
    const questions = inquirerPromptStub.args[3][0];

    const eventQuestion = questions.find((question: InquirerTypes.Question) => {
        return question.name === 'event';
    });
    const eventList = eventQuestion!.choices as Array<string>;
    const containFetchEnd = eventList!.includes('fetch::end::*');
    const containElement = eventList!.includes('element::');
    const data = t.context.handlebarsUtilsCompileTemplateStub.args[0][1];
    const events = data.events.map((event: { event: string }) => {
        return event.event;
    });
    const eventsSet = new Set(events);

    // 6 files (2 code + test + doc + tsconfig.json + package.json)
    t.is(t.context.handlebarsUtilsCompileTemplateStub.callCount, 6, `Handlebars doesn't complile the right number of files`);
    // 6 files (2 code + test + doc + tsconfig.json + package.json)
    t.is(t.context.writeFileAsyncDefaultStub.callCount, 6, 'Invalid number of files created');

    t.false(containFetchEnd);
    t.true(containElement);

    t.is(events.length, eventsSet.size);

    t.true(result);
    t.true(t.context.fsExtraCopyStub.calledOnce);
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
    const sandbox = t.context.sandbox;

    sandbox.stub(isOfficial, 'default').resolves(false);
    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(parserInfoResult)
        .onSecondCall()
        .resolves(parserEventsResult);

    const result = await newParser();

    // 7 files (2 code + test + doc + tsconfig.json + package.json + .hintrc)
    t.is(t.context.handlebarsUtilsCompileTemplateStub.callCount, 7, `Handlebars doesn't complile the right number of files`);
    // 7 files (2 code + test + doc + tsconfig.json + package.json + .hintrc)
    t.is(t.context.writeFileAsyncDefaultStub.callCount, 7, 'Invalid number of files created');

    t.true(result);
    t.true(t.context.fsExtraCopyStub.calledTwice);
});
