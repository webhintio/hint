import * as path from 'path';

import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface, ExecutionContext } from 'ava';

import * as handlebarsUtils from '../src/handlebars-utils';

type Inquirer = {
    prompt: () => Promise<any>;
};

type FsExtra = {
    copy: (orig: string, dest: string) => void;
};

type Mkdirp = (dir: string, callback: Function) => void;

type WriteFileAsyncModule = {
    default: () => void;
};

type IsOfficialModule = {
    default: () => Promise<boolean>;
};

type CWD = {
    default: () => string;
};

type HandlebarsUtils = {
    escapeSafeString: (str: string) => hbs.SafeString;
    compileTemplate: (filePath: string, data: any) => Promise<string>;
};

type CreateHintContext = {
    cwd: CWD;
    inquirer: Inquirer;
    isOfficialModule: IsOfficialModule;
    fsExtra: FsExtra;
    handlebarsUtils: HandlebarsUtils;
    mkdirp: Mkdirp;
    sandbox: sinon.SinonSandbox;
    writeFileAsyncModule: WriteFileAsyncModule;
}

const test = anyTest as TestInterface<CreateHintContext>;

const initContext = (t: ExecutionContext<CreateHintContext>) => {
    t.context.cwd = {
        default(): string {
            return '';
        }
    };
    t.context.fsExtra = { copy(orig: string, dest: string) { } };
    t.context.handlebarsUtils = {
        compileTemplate(filePath: string, data: any) {
            return Promise.resolve('');
        },
        escapeSafeString: handlebarsUtils.escapeSafeString
    };
    t.context.inquirer = {
        prompt() {
            return Promise.resolve({});
        }
    };
    t.context.isOfficialModule = {
        default() {
            return Promise.resolve(false);
        }
    };
    t.context.mkdirp = (dir: string, callback: Function) => {
        callback();
    };
    t.context.sandbox = sinon.createSandbox();
    t.context.writeFileAsyncModule = { default() { } };
};

const loadScript = (context: CreateHintContext) => {
    const script = proxyquire('../src/create-hint', {
        '../src/handlebars-utils': context.handlebarsUtils,
        'fs-extra': context.fsExtra,
        'hint/dist/src/lib/utils/fs/cwd': context.cwd,
        'hint/dist/src/lib/utils/fs/write-file-async': context.writeFileAsyncModule,
        'hint/dist/src/lib/utils/packages/is-official': context.isOfficialModule,
        inquirer: context.inquirer,
        mkdirp: context.mkdirp
    });

    return script.default;
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('It creates a hint if the option multiple hints is false', async (t) => {
    const results = {
        category: 'pwa',
        description: 'An awesome new hint',
        multi: false,
        name: 'awesome hint',
        useCase: 'request'
    };
    const root = '/tests/';
    const sandbox = sinon.createSandbox();

    const fsExtraCopyStub = sandbox.stub(t.context.fsExtra, 'copy').resolves();
    const miscWriteFileAsyncStub = sandbox.stub(t.context.writeFileAsyncModule, 'default').resolves();
    const handlebarsCompileTemplateStub = sandbox.stub(t.context.handlebarsUtils, 'compileTemplate').resolves('');

    sandbox.stub(t.context.isOfficialModule, 'default').resolves(true);
    sandbox.stub(t.context.cwd, 'default').returns(root);
    sandbox.stub(t.context.inquirer, 'prompt').resolves(results);

    const newHint = loadScript(t.context);
    const result = await newHint();

    t.true(fsExtraCopyStub.args[0][0].endsWith('files'), 'Unexpected path for official files');
    t.is(fsExtraCopyStub.args[0][1], path.join(root, 'hint-awesome-hint'), 'Copy path is not the expected one');

    // package.json, readme.md, tsconfig.json, hint.ts, meta.ts, tests/hint.ts
    t.is(handlebarsCompileTemplateStub.callCount, 6, `Handlebars doesn't complile the right number of files`);
    t.is(miscWriteFileAsyncStub.callCount, 6, 'Invalid number of files created');

    t.true(result);

    sandbox.restore();
});

test('It creates a package with multiple hints', async (t) => {
    const packageResults = {
        description: 'An awesome new package',
        multi: true,
        name: 'awesome package'
    };
    const hint1Results = {
        again: true,
        category: 'pwa',
        description: 'An awesome hint 1',
        name: 'hint',
        useCase: 'request'
    };
    const hint2Results = {
        again: false,
        category: 'pwa',
        description: 'An awesome hint 2',
        name: 'awesome hint 2',
        useCase: 'request'
    };
    const root = '/tests/';
    const sandbox = sinon.createSandbox();

    const fsExtraCopyStub = sandbox.stub(t.context.fsExtra, 'copy').resolves();
    const miscWriteFileAsyncStub = sandbox.stub(t.context.writeFileAsyncModule, 'default').resolves();
    const handlebarsCompileTemplateStub = sandbox.stub(t.context.handlebarsUtils, 'compileTemplate').resolves('');

    sandbox.stub(t.context.isOfficialModule, 'default').resolves(false);
    sandbox.stub(t.context.cwd, 'default').returns(root);
    sandbox.stub(t.context.inquirer, 'prompt')
        .onFirstCall()
        .resolves(packageResults)
        .onSecondCall()
        .resolves(hint1Results)
        .onThirdCall()
        .resolves(hint2Results);

    const newHint = loadScript(t.context);
    const result = await newHint();

    t.true(fsExtraCopyStub.args[0][0].endsWith('no-official-files'), 'Unexpected path for non official files');
    t.true(fsExtraCopyStub.args[1][0].endsWith('files'), 'Unexpected path for official files');
    t.is(fsExtraCopyStub.args[0][1], path.join(root, 'hint-awesome-package'), 'Copy path is not the expected one');
    t.is(fsExtraCopyStub.args[1][1], path.join(root, 'hint-awesome-package'), 'Copy path is not the expected one');

    // index.ts, package.json, readme.md, tsconfig.json, .hintrc, hint.ts * 2, meta.ts * 2 (one for each rule) + 1 for the meta.ts (index), tests/hint.ts * 2, docs/hint.md * 2
    t.is(handlebarsCompileTemplateStub.callCount, 14, `Handlebars doesn't complile the right number of files`);
    t.is(miscWriteFileAsyncStub.callCount, 14, 'Invalid number of files created');

    t.true(result);

    sandbox.restore();
});
