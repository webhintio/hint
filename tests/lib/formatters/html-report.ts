import test from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import * as path from 'path';
import { readFileAsync } from '../../../src/lib/utils/misc';

const templatePath = path.join(__dirname, '../../../src/lib/formatters/html-report/report.hbs');
const noProblemHtmlPath = path.join(__dirname, 'fixtures/html-report-no-problem.html');
const multipleProblemsPath = path.join(__dirname, 'fixtures/html-report-multiple-problems.html');
const multipleResourcesPath = path.join(__dirname, 'fixtures/html-report-multiple-resources.html');
let template;

const stubFsObject = {
    mkdir() { },
    readFile() { },
    stat() { },
    writeFile() { }
};

const stubPromisifiedMethodObject = {
    mkdirAsync() { },
    readFileAsync() { },
    statAsync() { },
    writeFileAsync() { }
};

const stubUtilObject = {
    promisify(method) {
        return stubPromisifiedMethodObject[`${method.name}Async`];
    }
};

proxyquire('../../../src/lib/formatters/html-report/html-report', {
    fs: stubFsObject,
    util: stubUtilObject
});

import htmlReport from '../../../src/lib/formatters/html-report/html-report';
import * as problems from './fixtures/list-of-problems';

test.beforeEach(async (t) => {
    template = template || await readFileAsync(templatePath);

    sinon.stub(stubPromisifiedMethodObject, 'writeFileAsync').resolves();
    sinon.stub(stubPromisifiedMethodObject, 'readFileAsync').resolves(template);
    sinon.stub(stubPromisifiedMethodObject, 'mkdirAsync').resolves();
    sinon.spy(stubUtilObject, 'promisify');

    t.context.promisify = stubUtilObject.promisify;
    t.context.writeFileAsync = stubPromisifiedMethodObject.writeFileAsync;
    t.context.readFileAsync = stubPromisifiedMethodObject.readFileAsync;
    t.context.mkdirAsync = stubPromisifiedMethodObject.mkdirAsync;
});

test.afterEach.always((t) => {
    t.context.promisify.restore();
    t.context.writeFileAsync.restore();
    t.context.readFileAsync.restore();
    t.context.mkdirAsync.restore();
});

test.serial(`There is no problem`, async (t) => {
    const writeFileAsyncFn = t.context.writeFileAsync;
    const noProblemHtml = await readFileAsync(noProblemHtmlPath);

    sinon.stub(stubPromisifiedMethodObject, 'statAsync').resolves();
    t.context.statAsync = stubPromisifiedMethodObject.statAsync;

    await htmlReport.format(problems.noproblems);

    t.is(t.context.statAsync.callCount, 1);
    t.is(t.context.mkdirAsync.callCount, 0);
    t.is(t.context.readFileAsync.callCount, 1);
    t.is(writeFileAsyncFn.callCount, 1);
    t.is(writeFileAsyncFn.args[0][1], noProblemHtml);

    t.context.statAsync.restore();
});

test.serial('Multiple problems', async (t) => {
    const writeFileAsyncFn = t.context.writeFileAsync;
    const multipleProblemHtml = await readFileAsync(multipleProblemsPath);

    sinon.stub(stubPromisifiedMethodObject, 'statAsync').resolves();
    t.context.statAsync = stubPromisifiedMethodObject.statAsync;

    await htmlReport.format(problems.multipleproblems);

    t.is(t.context.statAsync.callCount, 1);
    t.is(t.context.mkdirAsync.callCount, 0);
    t.is(t.context.readFileAsync.callCount, 1);
    t.is(writeFileAsyncFn.callCount, 1);
    t.is(writeFileAsyncFn.args[0][1], multipleProblemHtml);

    t.context.statAsync.restore();
});

test.serial('Multiple resources', async (t) => {
    const writeFileAsyncFn = t.context.writeFileAsync;
    const multipleResourcesHtml = await readFileAsync(multipleResourcesPath);

    sinon.stub(stubPromisifiedMethodObject, 'statAsync').resolves();
    t.context.statAsync = stubPromisifiedMethodObject.statAsync;

    await htmlReport.format(problems.multipleproblems);

    t.is(t.context.statAsync.callCount, 1);
    t.is(t.context.mkdirAsync.callCount, 0);
    t.is(t.context.readFileAsync.callCount, 1);
    t.is(writeFileAsyncFn.callCount, 1);
    t.is(writeFileAsyncFn.args[0][1], multipleResourcesHtml);

    t.context.statAsync.restore();
});

test.serial(`Report folder doesn't exist`, async (t) => {
    sinon.stub(stubPromisifiedMethodObject, 'statAsync').rejects();
    t.context.statAsync = stubPromisifiedMethodObject.statAsync;

    await htmlReport.format(problems.multipleproblems);

    t.is(t.context.mkdirAsync.callCount, 1);

    t.context.statAsync.restore();
});
