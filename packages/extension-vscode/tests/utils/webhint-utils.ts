import anyTest, { TestFn } from 'ava';

import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

type SandboxContext = {
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestFn<SandboxContext>;

const mockContext = (context: SandboxContext) => {
    const fsMocks = {
        promises: {
            readFile(): void {
                return;
            },
            writeFile(): void {
                return;
            }
        }
    };

    const readFileStub = context.sandbox.stub(fsMocks.promises, 'readFile');
    const writeFileStub = context.sandbox.stub(fsMocks.promises, 'writeFile');

    const script: typeof import('../../src/utils/webhint-utils') = proxyquire('../../src/utils/webhint-utils', { fs: { promises: { readFile: readFileStub, writeFile: writeFileStub } } });

    return {
        MockWebhintConfiguratorParser: script.WebhintConfiguratorParser,
        readFileStub,
        writeFileStub
    };
};

test.beforeEach((t) => {
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test.serial('It returns the config file if it does exists in the given path', async (t) => {
    const expectedPath = path.join(__dirname, '../fixtures/with-hint/.hintrc');
    const expectedFileContents = await fs.promises.readFile(expectedPath);

    const { MockWebhintConfiguratorParser, readFileStub, writeFileStub } = mockContext(t.context);

    const configParser = new MockWebhintConfiguratorParser();

    readFileStub.resolves(expectedFileContents);
    const result = await configParser.initialize(expectedPath);

    t.not(result, null);
    t.not(result, undefined);
    t.deepEqual(result, JSON.parse(expectedFileContents.toString()));
    t.is(writeFileStub.callCount, 0);
    t.is(readFileStub.callCount, 1);
});

test.serial('It creates a config file if it does not exists in the given path', async (t) => {
    const expectedPath = path.join(__dirname, './fixtures/does-not-exists');
    const sampleFile = path.join(__dirname, '../fixtures/with-hint/.hintrc');
    const sampleFileContents = await fs.promises.readFile(sampleFile);

    const { MockWebhintConfiguratorParser, readFileStub, writeFileStub } = mockContext(t.context);

    const configParser = new MockWebhintConfiguratorParser();

    readFileStub.resolves(sampleFileContents);
    await configParser.initialize(expectedPath);

    t.is(writeFileStub.callCount, 1);
    t.is(readFileStub.callCount, 1);
});

test.serial('It correctly ignores a problem in an existing configuration file with a previous hint', async (t) => {
    const expectedPath = path.join(__dirname, '../fixtures/with-hint/.hintrc');
    const sampleFileContents = await fs.promises.readFile(expectedPath);
    const expectedResults = JSON.parse(sampleFileContents.toString());

    expectedResults.hints['compat-api/css'] = JSON.parse('["error", {"ignore":["grid-column"]}]');

    const { MockWebhintConfiguratorParser, readFileStub, writeFileStub } = mockContext(t.context);

    const configParser = new MockWebhintConfiguratorParser();

    readFileStub.resolves(sampleFileContents);
    await configParser.initialize(expectedPath);
    configParser.addProblemToIgnoredHintsConfig('compat-api/css', 'grid-column');

    t.is(writeFileStub.callCount, 1);
    t.is(readFileStub.callCount, 1);
    t.is((writeFileStub.getCall(0).args as unknown as Array<string>)[0], expectedPath);
    const result = JSON.parse((writeFileStub.getCall(0).args as unknown as Array<string>)[1]);

    t.deepEqual(result, expectedResults);
});

test.serial('It correctly ignores a problem in an existing configuration file without a previous hint section', async (t) => {
    const expectedPath = path.join(__dirname, '../fixtures/no-hint-property/.hintrc');
    const sampleFileContents = await fs.promises.readFile(expectedPath);
    const expectedResults = JSON.parse(sampleFileContents.toString());

    expectedResults.hints = {};
    expectedResults.hints['compat-api/css'] = JSON.parse('["default", {"ignore":["grid-column"]}]');

    const { MockWebhintConfiguratorParser, readFileStub, writeFileStub } = mockContext(t.context);

    const configParser = new MockWebhintConfiguratorParser();

    readFileStub.resolves(sampleFileContents);
    await configParser.initialize(expectedPath);
    configParser.addProblemToIgnoredHintsConfig('compat-api/css', 'grid-column');

    t.is(writeFileStub.callCount, 1);
    t.is(readFileStub.callCount, 1);
    t.is((writeFileStub.getCall(0).args as unknown as Array<string>)[0], expectedPath);
    const result = JSON.parse((writeFileStub.getCall(0).args as unknown as Array<string>)[1]);

    t.deepEqual(result, expectedResults);
});

test.serial('It correctly ignores a problem in an existing configuration file with a previous ignored problem', async (t) => {
    const expectedPath = path.join(__dirname, '../fixtures/with-problem/.hintrc');
    const sampleFileContents = await fs.promises.readFile(expectedPath);
    const expectedResults = JSON.parse(sampleFileContents.toString());

    expectedResults.hints['compat-api/css'] = JSON.parse('["error", { "ignore": ["grid-row", "grid-column"]}]');

    const { MockWebhintConfiguratorParser, readFileStub, writeFileStub } = mockContext(t.context);

    const configParser = new MockWebhintConfiguratorParser();

    readFileStub.resolves(sampleFileContents);
    await configParser.initialize(expectedPath);
    configParser.addProblemToIgnoredHintsConfig('compat-api/css', 'grid-column');

    t.is(writeFileStub.callCount, 1);
    t.is(readFileStub.callCount, 1);
    t.is((writeFileStub.getCall(0).args as unknown as Array<string>)[0], expectedPath);
    const result = JSON.parse((writeFileStub.getCall(0).args as unknown as Array<string>)[1]);

    t.deepEqual(result, expectedResults);
});

test.serial('It correctly ignores a problem in a new configuration file with a previous hint', async (t) => {
    const expectedPath = path.join(__dirname, '../fixtures/does-not-exists');
    const sampleFile = path.join(__dirname, '../fixtures/with-hint/.hintrc');
    const sampleFileContents = await fs.promises.readFile(sampleFile);
    const expectedResults = JSON.parse(sampleFileContents.toString());

    expectedResults.hints['compat-api/css'] = JSON.parse('["error", {"ignore":["grid-column"]}]');

    const { MockWebhintConfiguratorParser, readFileStub, writeFileStub } = mockContext(t.context);

    const configParser = new MockWebhintConfiguratorParser();

    readFileStub.resolves(sampleFileContents);
    await configParser.initialize(expectedPath);
    configParser.addProblemToIgnoredHintsConfig('compat-api/css', 'grid-column');

    t.is(writeFileStub.callCount, 2);
    t.is(readFileStub.callCount, 1);
    t.is((writeFileStub.getCall(1).args as unknown as Array<string>)[0], expectedPath);
    const result = JSON.parse((writeFileStub.getCall(1).args as unknown as Array<string>)[1]);

    t.deepEqual(result, expectedResults);
});

test.serial('It correctly ignores a problem in an existing configuration file with no hints', async (t) => {
    const expectedPath = path.join(__dirname, '../fixtures/no-hints/.hintrc');
    const sampleFileContents = await fs.promises.readFile(expectedPath);
    const expectedResults = JSON.parse(sampleFileContents.toString());

    expectedResults.hints['compat-api/css'] = JSON.parse('["default", {"ignore":["grid-column"]}]');

    const { MockWebhintConfiguratorParser, readFileStub, writeFileStub } = mockContext(t.context);

    const configParser = new MockWebhintConfiguratorParser();

    readFileStub.resolves(sampleFileContents);
    await configParser.initialize(expectedPath);
    configParser.addProblemToIgnoredHintsConfig('compat-api/css', 'grid-column');

    t.is(writeFileStub.callCount, 1);
    t.is(readFileStub.callCount, 1);
    t.is((writeFileStub.getCall(0).args as unknown as Array<string>)[0], expectedPath);
    const result = JSON.parse((writeFileStub.getCall(0).args as unknown as Array<string>)[1]);

    t.deepEqual(result, expectedResults);
});

test.serial('It handles adding an empty hint in an existing configuration file with no hints', async (t) => {
    const expectedPath = path.join(__dirname, '../fixtures/no-hints/.hintrc');
    const sampleFileContents = await fs.promises.readFile(expectedPath);

    const { MockWebhintConfiguratorParser, readFileStub, writeFileStub } = mockContext(t.context);

    const configParser = new MockWebhintConfiguratorParser();

    readFileStub.resolves(sampleFileContents);
    await configParser.initialize(expectedPath);
    configParser.addProblemToIgnoredHintsConfig('compat-api/css', '');

    t.is(writeFileStub.callCount, 0);
    t.is(readFileStub.callCount, 1);
});

test.serial('It correctly ignores a problem in an existing configuration file with no hints section', async (t) => {
    const expectedPath = path.join(__dirname, '../fixtures/no-hint-property/.hintrc');
    const sampleFileContents = await fs.promises.readFile(expectedPath);
    const expectedResults = JSON.parse(sampleFileContents.toString());

    expectedResults.hints = {};
    expectedResults.hints['compat-api/css'] = JSON.parse('["default", {"ignore":["grid-column"]}]');

    const { MockWebhintConfiguratorParser, readFileStub, writeFileStub } = mockContext(t.context);

    const configParser = new MockWebhintConfiguratorParser();

    readFileStub.resolves(sampleFileContents);
    await configParser.initialize(expectedPath);
    configParser.addProblemToIgnoredHintsConfig('compat-api/css', 'grid-column');

    t.is(writeFileStub.callCount, 1);
    t.is(readFileStub.callCount, 1);
    t.is((writeFileStub.getCall(0).args as unknown as Array<string>)[0], expectedPath);
    const result = JSON.parse((writeFileStub.getCall(0).args as unknown as Array<string>)[1]);

    t.deepEqual(result, expectedResults);
});

test.serial('It correctly ignores a hint in an existing configuration file with no previous hints', async (t) => {
    const expectedPath = path.join(__dirname, '../fixtures/no-hints/.hintrc');
    const sampleFileContents = await fs.promises.readFile(expectedPath);
    const expectedResults = JSON.parse(sampleFileContents.toString());

    expectedResults.hints['compat-api/css'] = 'off';

    const { MockWebhintConfiguratorParser, readFileStub, writeFileStub } = mockContext(t.context);

    const configParser = new MockWebhintConfiguratorParser();

    readFileStub.resolves(sampleFileContents);
    await configParser.initialize(expectedPath);
    configParser.ignoreHintPerProject('compat-api/css');

    t.is(writeFileStub.callCount, 1);
    t.is(readFileStub.callCount, 1);
    t.is((writeFileStub.getCall(0).args as unknown as Array<string>)[0], expectedPath);
    const result = JSON.parse((writeFileStub.getCall(0).args as unknown as Array<string>)[1]);

    t.deepEqual(result, expectedResults);
});

test.serial('Empty hint is ignored correctly', async (t) => {
    const expectedPath = path.join(__dirname, '../fixtures/no-hints/.hintrc');
    const sampleFileContents = await fs.promises.readFile(expectedPath);

    const { MockWebhintConfiguratorParser, readFileStub, writeFileStub } = mockContext(t.context);

    const configParser = new MockWebhintConfiguratorParser();

    readFileStub.resolves(sampleFileContents);
    await configParser.initialize(expectedPath);
    configParser.ignoreHintPerProject('');

    t.is(writeFileStub.callCount, 0);
    t.is(readFileStub.callCount, 1);
});

test.serial('It correctly handles ignoring a hint without initialization', async (t) => {
    const expectedPath = path.join(__dirname, '../fixtures/no-hints/.hintrc');
    const sampleFileContents = await fs.promises.readFile(expectedPath);

    const { MockWebhintConfiguratorParser, readFileStub, writeFileStub } = mockContext(t.context);

    const configParser = new MockWebhintConfiguratorParser();

    readFileStub.resolves(sampleFileContents);
    configParser.ignoreHintPerProject('compat-api/css');

    t.is(writeFileStub.callCount, 0);
    t.is(readFileStub.callCount, 0);
});
