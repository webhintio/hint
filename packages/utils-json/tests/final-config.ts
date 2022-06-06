import anyTest, { TestFn, ExecutionContext } from 'ava';

import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

import { IParsingError } from '../src/types';

type FileModule = {
    extends: string | null;
    name: string;
};

type LoadJSONFileModule = () => FileModule | string | null;

type AsPathString = () => string;

type ParserContext = {
    asPathString: AsPathString;
    loadJSONFileModule: LoadJSONFileModule;
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestFn<ParserContext>;

const asUri = { getAsUri() { } };

const initContext = (t: ExecutionContext<ParserContext>) => {
    t.context.loadJSONFileModule = (): FileModule | null => {
        return null;
    };

    t.context.asPathString = (): string => {
        return '';
    };

    t.context.sandbox = sinon.createSandbox();
};

const loadScript = (context: ParserContext) => {
    const script: typeof import('../src/final-config') = proxyquire('../src/final-config', {
        '@hint/utils-fs': { loadJSONFile: context.loadJSONFileModule },
        '@hint/utils-network': {
            asPathString: context.asPathString,
            asUri
        }
    });

    return script.finalConfig;
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test(`If config doesn't have an extends property, it should return the same object`, (t) => {
    const finalConfig = loadScript(t.context);
    const config = { extends: '' };

    const result = finalConfig(config, 'resource');

    t.true(config === result);
});

test('If there is a circular reference, it should return an instance of an Error', (t) => {
    const sandbox = t.context.sandbox;

    const baseConfigPath = path.join(__dirname, 'fixtures', 'baseConfigCircular.json');

    sandbox.stub(t.context, 'asPathString').returns(baseConfigPath);

    const finalConfig = loadScript(t.context);
    const config = JSON.parse(fs.readFileSync(baseConfigPath).toString()); // eslint-disable-line no-sync

    const result = finalConfig(config, 'circularReference') as IParsingError;

    t.true(result instanceof Error);
    t.is(result.message, `Circular reference found in file ${baseConfigPath}`);
});

test('If one of the extended files is not a valid JSON, it should return an instance of an Error', (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context, 'asPathString').returns('valid-with-invalid-extends');
    sandbox.stub(t.context, 'loadJSONFileModule').throws(new Error('InvalidJSON'));

    const finalConfig = loadScript(t.context);

    const config = { extends: 'invalid-extends' };

    const result = finalConfig(config, 'valid-with-invalid-extends') as IParsingError;

    t.true(result instanceof Error);
});

test(`If one of the extended files is not a valid JSON location, it should return a MODULE_NOT_FOUND error`, (t) => {
    const customError = new Error('customError') as IParsingError;

    customError.code = 'MODULE_NOT_FOUND';

    const baseConfigPath = path.join(__dirname, 'fixtures', 'baseConfig.json');
    const config = JSON.parse(fs.readFileSync(baseConfigPath).toString()); // eslint-disable-line no-sync

    const finalConfig = loadScript(t.context);
    const result = finalConfig(config, 'incorrect_path');

    t.true(result && (result as IParsingError).code === 'MODULE_NOT_FOUND');
});

test(`If one of the extended files is a JSON module, it should inherit from it`, (t) => {
    const sandbox = t.context.sandbox;
    const baseConfigPath = path.join(__dirname, 'fixtures', 'baseConfig.json');
    const config = JSON.parse(fs.readFileSync(baseConfigPath).toString()); // eslint-disable-line no-sync
    const data = fs.readFileSync(path.join(__dirname, 'fixtures', 'node_modules', config.extends)); // eslint-disable-line no-sync
    const parsedBaseConfig = JSON.parse(data.toString());

    sandbox.stub(t.context, 'loadJSONFileModule').returns(parsedBaseConfig);
    sandbox.stub(t.context, 'asPathString').returns(baseConfigPath);

    const finalConfig = loadScript(t.context);

    const result = finalConfig(config, baseConfigPath);

    const baseConfig = JSON.parse(data.toString());

    t.true((result as unknown as typeof baseConfig).compilerOptions.noImplicitAny ===
        baseConfig.compilerOptions.noImplicitAny);
    t.true((result as unknown as typeof baseConfig).compilerOptions.E2ETestingValue);
});

test(`If everything is ok, it should merge all the extended configurations`, (t) => {
    const sandbox = t.context.sandbox;
    const baseConfigPath = path.join(__dirname, 'fixtures', 'baseConfig.json');
    const config = JSON.parse(fs.readFileSync(baseConfigPath).toString()); // eslint-disable-line no-sync

    config.checkJS = true;

    const data = fs.readFileSync(path.join(__dirname, 'fixtures', 'node_modules', config.extends)); // eslint-disable-line no-sync
    const parsedBaseConfig = JSON.parse(data.toString());

    sandbox.stub(t.context, 'loadJSONFileModule').returns(parsedBaseConfig);
    sandbox.stub(t.context, 'asPathString').returns(baseConfigPath);

    const finalConfig = loadScript(t.context);

    const result = finalConfig(config, baseConfigPath);

    const baseConfig = JSON.parse(data.toString());

    t.true((result as unknown as typeof baseConfig).compilerOptions.noImplicitAny ===
        baseConfig.compilerOptions.noImplicitAny);
    t.true((result as unknown as typeof baseConfig).compilerOptions.E2ETestingValue);
    t.true((result as unknown as typeof baseConfig).checkJS);
});

test(`If an error occurs while loading the configuration file it should throw an error`, (t) => {
    const sandbox = t.context.sandbox;
    const baseConfigPath = path.join(__dirname, 'fixtures', 'baseConfig.json');
    const config = JSON.parse(fs.readFileSync(baseConfigPath).toString()); // eslint-disable-line no-sync

    sandbox.stub(t.context, 'loadJSONFileModule').throws('text_exception');
    sandbox.stub(t.context, 'asPathString').returns(baseConfigPath);

    const finalConfig = loadScript(t.context);
    const result = finalConfig(config, baseConfigPath);

    t.true(result instanceof Error);
    t.is(result.name, `text_exception`);
    t.true(result.resource.includes('baseConfig.json'));
});
