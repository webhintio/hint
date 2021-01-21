import * as path from 'path';

import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import { Category, Severity } from '@hint/utils-types';

import Result, { CategoryResult } from '../src/result';
import * as problems from './fixtures/list-of-problems';
import { MarkdownHelpers } from '../src/utils';
import { Problem } from '@hint/utils-types';

type FsExtra = {
    copyFile: () => void;
    existsSync: () => boolean;
    outputFile: (path: string) => void;
    readFile: () => string;
    readFileSync: () => string;
    unlink: () => void;
};

type MarkdownContext = {
    fsExtra: FsExtra;
};

const test = anyTest as TestInterface<MarkdownContext>;

const initContext = (t: ExecutionContext<MarkdownContext>) => {
    t.context.fsExtra = {
        copyFile() { },
        existsSync() {
            return true;
        },
        outputFile(path: string) { },
        readFile() {
            return '';
        },
        readFileSync() {
            return '';
        },
        unlink() { }
    };
};

const loadScript = (context: MarkdownContext) => {
    const script = proxyquire('../src/formatter', {
        '@hint/utils-fs': {
            readFileAsync() {
                return '';
            }
        },
        'fs-extra': {
            '@noCallThru': true,
            ...context.fsExtra
        }
    });

    return script.default;
};

test.beforeEach(initContext);

test(`Markdown formatter returns the right object`, async (t) => {
    const MarkdownFormatter = loadScript(t.context);
    const formatter = new MarkdownFormatter();

    const result: Result = await formatter.format(problems.noproblems, { noGenerateFiles: true, target: 'http://example.com' });

    t.plan((result.categories.length * 2) + 2);

    t.is(result.categories.length, 8);
    t.is(result.hintsCount, 0);

    result.categories.forEach((cat) => {
        t.is(cat.hints.length, 0);
        t.is(cat.hintsCount, 0);
    });
});

test(`Markdown formatter returns the right number of errors and warnings`, async (t) => {
    const MarkdownFormatter = loadScript(t.context);
    const formatter = new MarkdownFormatter();

    const result: Result = await formatter.format(problems.multipleproblems, {
        noGenerateFiles: true,
        target: 'http://example.com'
    });

    t.plan(13);

    t.is(result.categories.length, 8);
    t.is(result.hintsCount, 5);

    const otherCategory = result.getCategoryByName(Category.other);
    const devCategory = result.getCategoryByName(Category.development);

    if (otherCategory) {
        t.is(otherCategory.hints.length, 1);
        t.is(otherCategory.hintsCount, 4);

        const hint = otherCategory.getHintByName('random-hint');

        if (hint) {
            t.is(hint.problems.length, 4);
            t.is(hint.count, 4);
        }
    }

    if (devCategory) {
        t.is(devCategory.hints.length, 1);
        t.is(devCategory.hintsCount, 1);

        const hint = devCategory.getHintByName('axe');

        if (hint) {
            t.is(hint.problems.length, 1);
            t.is(hint.count, 1);
            t.is(hint.thirdPartyInfo.link, 'https://github.com/dequelabs/axe-core');
        }
    }

    result.removeCategory(Category.development);

    t.is(result.categories.length, 7);
    t.is(result.hintsCount, 4);
});

test(`Markdown formatter return the right value for isFinish`, async (t) => {
    const MarkdownFormatter = loadScript(t.context);
    const formatter = new MarkdownFormatter();

    const result: Result = await formatter.format(problems.multipleproblems, {
        noGenerateFiles: true,
        status: 'error',
        target: 'http://example.com'
    });

    t.is(result.isFinish, true);
});

test(`Markdown formatter return the right scan time`, async (t) => {
    const MarkdownFormatter = loadScript(t.context);
    const formatter = new MarkdownFormatter();

    const result: Result = await formatter.format(problems.multipleproblems, {
        noGenerateFiles: true,
        scanTime: 4500000,
        target: 'http://example.com'
    });

    t.is(result.scanTime, '01:15:00');
});

test(`Markdown formatter return the right third party logo url`, async (t) => {
    const MarkdownFormatter = loadScript(t.context);
    const formatter = new MarkdownFormatter();

    const result1: Result = await formatter.format(problems.multipleproblems, {
        noGenerateFiles: true,
        target: 'http://example.com'
    });
    const result2: Result = await formatter.format(problems.multipleproblems, {
        isScanner: true,
        noGenerateFiles: true,
        target: 'http://example.com'
    });

    const category1 = result1.getCategoryByName(Category.development);
    const category2 = result2.getCategoryByName(Category.development);

    t.plan(2);

    if (category1 && category2) {
        const axe1 = category1.getHintByName('axe');
        const axe2 = category2.getHintByName('axe');

        if (axe1) {
            t.is(axe1.thirdPartyInfo.logo.url, 'images/scan/axe.png');
        }

        if (axe2) {
            t.is(axe2.thirdPartyInfo.logo.url, '/images/scan/axe.png');
        }
    }
});

test(`Markdown formatter create copy and generate the right files`, async (t) => {
    const sandbox = sinon.createSandbox();

    const fsExtraCopySpy = sandbox.spy(t.context.fsExtra, 'copyFile');
    const fsExtraOutputFileSpy = sandbox.spy(t.context.fsExtra, 'outputFile');

    const MarkdownFormatter = loadScript(t.context);
    const formatter = new MarkdownFormatter();

    await formatter.format(problems.noproblems, {
        config: {},
        target: 'http://example.com'
    });

    t.true(fsExtraCopySpy.calledOnce);
    t.is(fsExtraOutputFileSpy.callCount, 1, 'The output spy count is wrong');

    sandbox.restore();
});

test(`Markdown formatter create copy and generate the right files if an output is provided`, async (t) => {
    const sandbox = sinon.createSandbox();

    const fsExtraCopyFileSpy = sandbox.spy(t.context.fsExtra, 'copyFile');
    const fsExtraOutputFileSpy = sandbox.spy(t.context.fsExtra, 'outputFile');
    const fsExtraUnlinkSpy = sandbox.spy(t.context.fsExtra, 'unlink');

    const MarkdownFormatter = loadScript(t.context);
    const formatter = new MarkdownFormatter();
    const outputFolder = path.join(process.cwd(), 'outputfolder');

    await formatter.format(problems.noproblems, {
        config: {},
        output: outputFolder,
        target: 'http://example.com'
    });

    t.true(fsExtraCopyFileSpy.calledOnce);
    t.is(fsExtraOutputFileSpy.callCount, 1);
    t.true(fsExtraOutputFileSpy.args[0][0].includes(outputFolder));
    t.true(fsExtraUnlinkSpy.calledOnce);

    sandbox.restore();
});

test(`Markdown formatter shoudn't copy and generate any file if option noGenerateFiles is passed`, async (t) => {
    const sandbox = sinon.createSandbox();

    const fsExtraCopySpy = sandbox.spy(t.context.fsExtra, 'copyFile');
    const fsExtraOutputFileSpy = sandbox.spy(t.context.fsExtra, 'outputFile');

    const MarkdownFormatter = loadScript(t.context);
    const formatter = new MarkdownFormatter();

    await formatter.format(problems.noproblems, {
        noGenerateFiles: true,
        target: 'http://example.com'
    });

    t.false(fsExtraCopySpy.called);
    t.false(fsExtraOutputFileSpy.called);

    sandbox.restore();
});

test('Create header should create a header with the relevant amount of #s', (t) => {
    const hashCount = 4;
    const title = 'Test';
    const hashStringExpected = '#### Test';

    const result = MarkdownHelpers.createHeader(title, hashCount);

    t.is(result, hashStringExpected, 'Create header should create a header with the right amount of hashes while add the title');
});

test('Code snippet should default to HTML when no language given', (t) => {
    const result = MarkdownHelpers.createCodeSnippet('<h1>Test</h1>', null);

    t.assert(result.includes('html'), 'Code should default to html when no language provided');
});

test('When getting a severity icon a string must always be returned.', (t) => {

    const severities = [
        Severity.default,
        Severity.error,
        Severity.hint,
        Severity.information,
        Severity.warning,
        Severity.off
    ];

    t.plan(severities.length);

    severities.forEach((severity) => {
        const result = MarkdownHelpers.getSeverityIcon(severity);

        t.assert(result || result === '', `A string was not returned ${severity}`);
    });
});

test('When a markdown image is requested from the Link creator a valid markdown image should be returned', (t) => {
    const altText = 'alternate text';
    const image = 'some-image.jpg';

    const expected = `![${altText}](${image})`;
    const actual = MarkdownHelpers.createLink(altText, image, true);

    t.is(actual, expected, `link is invalid actual ${actual}`);
});

test('Adding a hint that passes should increase the size of the passed hints', (t) => {
    const hintName = 'TestHint';
    const status = 'pass';
    const res = new CategoryResult('SomeName', 'https://example.com', false);
    const before = res.passed.length;

    res.addHint(hintName, status);

    t.assert(before < res.passed.length);
});

test('Adding a hint that passes should increase the size of hints', (t) => {
    const hintName = 'TestHint';
    const status = 'fail';
    const res = new CategoryResult('SomeName', 'https://example.com', false);
    const before = res.hints.length;

    res.addHint(hintName, status);

    t.assert(before < res.hints.length);
});

test('Having no problems will result in return an empty string', (t) => {
    const arrayOfProblems: Problem[] = [];

    const response = MarkdownHelpers.getHintLevelSummary(arrayOfProblems);

    t.assert(response === '');
});

test('Having a problems will result in return an string with three *s for each severity', (t) => {
    const arrayOfProblems: Problem[] = problems.oneOfEachSeverity;

    const expected = 3;
    const response = MarkdownHelpers.getHintLevelSummary(arrayOfProblems);
    const amountOfStars = response.split('').filter((c) => {
        return c === '*';
    }).length;

    t.assert(amountOfStars === expected);
});
