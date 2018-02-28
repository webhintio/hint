import * as path from 'path';

import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';

import { CLIOptions } from '../../../../src/lib/types';

const actions = ({ newParser: true } as CLIOptions);

const fsExtra = { copy() { } };
const inquirer = { prompt() { } };
const misc = {
    isOfficial() { },
    normalizeStringByDelimiter() { },
    readFileAsync() { },
    writeFileAsync() { }
};
const handlebars = {
    compileTemplate() { },
    escapeSafeString() { }
};
const mkdirp = (dir, callback) => {
    callback();
};

proxyquire('../../../../src/lib/cli/parsers/new-parser', {
    '../../utils/handlebars': handlebars,
    '../../utils/misc': misc,
    'fs-extra': fsExtra,
    inquirer,
    mkdirp
});

import * as parser from '../../../../src/lib/cli/parsers/new-parser';

test.beforeEach((t) => {
    sinon.stub(fsExtra, 'copy').resolves();
    sinon.stub(misc, 'writeFileAsync').resolves();
    sinon.stub(misc, 'normalizeStringByDelimiter').returns('');
    sinon.stub(misc, 'readFileAsync').resolves('');
    sinon.stub(handlebars, 'compileTemplate').returns('');

    t.context.fs = fsExtra;
    t.context.misc = misc;
    t.context.handlebars = handlebars;
});

test.afterEach.always((t) => {
    t.context.fs.copy.restore();
    t.context.misc.writeFileAsync.restore();
    t.context.misc.normalizeStringByDelimiter.restore();
    t.context.misc.readFileAsync.restore();
    t.context.handlebars.compileTemplate.restore();
});


test.serial('If newParser is not an option, it should return false', async (t) => {
    const result = await parser.newParser({} as CLIOptions);

    t.false(result);
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
    const sandbox = sinon.sandbox.create();

    const packageRoot = path.join(__dirname, '../../../../../');

    sandbox.stub(misc, 'isOfficial').resolves(true);
    sandbox.stub(process, 'cwd').returns(packageRoot);
    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(parserInfoResult)
        .onSecondCall()
        .resolves(parserEventsResult);

    const result = await parser.newParser(actions);

    // 6 files (2 code + test + doc + tsconfig.json + package.json)
    t.is(t.context.handlebars.compileTemplate.callCount, 6, `Handlebars doesn't complile the right number of files`);
    // 6 files (2 code + test + doc + tsconfig.json + package.json)
    t.is(t.context.misc.writeFileAsync.callCount, 6, 'Invalid number of files created');

    t.true(result);
    t.false(t.context.fs.copy.called);

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
    const sandbox = sinon.sandbox.create();
    const packageRoot = path.join(__dirname, '../../../../../');

    sandbox.stub(misc, 'isOfficial').resolves(true);
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

    const result = await parser.newParser(actions);
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
    t.is(t.context.misc.writeFileAsync.callCount, 6, 'Invalid number of files created');

    t.false(containFetchEnd);
    t.true(containElement);

    t.is(events.length, eventsSet.size);

    t.true(result);
    t.false(t.context.fs.copy.called);

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
    const sandbox = sinon.sandbox.create();

    sandbox.stub(misc, 'isOfficial').resolves(false);
    sandbox.stub(inquirer, 'prompt')
        .onFirstCall()
        .resolves(parserInfoResult)
        .onSecondCall()
        .resolves(parserEventsResult);

    const result = await parser.newParser(actions);

    // 6 files (2 code + test + doc + tsconfig.json + package.json)
    t.is(t.context.handlebars.compileTemplate.callCount, 6, `Handlebars doesn't complile the right number of files`);
    // 6 files (2 code + test + doc + tsconfig.json + package.json)
    t.is(t.context.misc.writeFileAsync.callCount, 6, 'Invalid number of files created');

    t.true(result);
    t.true(t.context.fs.copy.calledOnce);

    sandbox.restore();
});
