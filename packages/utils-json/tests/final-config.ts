import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

import { IParsingError } from '../src/types';

type FileModule = {
    extends: string | null;
    name: string;
};

type LoadJSONFileModule = () => FileModule | null;

type AsPathString = () => string;

type Path = {
    dirname: () => string;
    resolve: () => string;
};

type ParserContext = {
    asPathString: AsPathString;
    loadJSONFileModule: LoadJSONFileModule;
    path: Path;
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<ParserContext>;

const asUri = { getAsUri() { } };

const initContext = (t: ExecutionContext<ParserContext>) => {
    t.context.loadJSONFileModule = (): FileModule | null => {
        return null;
    };

    t.context.asPathString = (): string => {
        return '';
    };

    t.context.path = {
        dirname(): string {
            return '';
        },
        resolve(): string {
            return '';
        }
    };
    t.context.sandbox = sinon.createSandbox();
};

const loadScript = (context: ParserContext) => {
    const script: typeof import('../src/final-config') = proxyquire('../src/final-config', {
        '@hint/utils-fs': { loadJSONFile: context.loadJSONFileModule },
        '@hint/utils-network': {
            asPathString: context.asPathString,
            asUri
        },
        path: context.path
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

    sandbox.stub(t.context, 'asPathString').returns('circularReference');
    sandbox.stub(t.context.path, 'resolve').returns('circularReference');

    const finalConfig = loadScript(t.context);
    const config = { extends: 'circularReference' };

    const result = finalConfig(config, 'circularReference') as IParsingError;

    t.true(result instanceof Error);
    t.is(result.message, 'Circular reference found in file circularReference');
});

test('If one of the extended files is no a valid JSON, it should return an instance of an Error', (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context, 'asPathString').returns('valid-with-invalid-extends');
    sandbox.stub(t.context.path, 'resolve').returns('invalid-extends');
    sandbox.stub(t.context, 'loadJSONFileModule').throws(new Error('InvalidJSON'));

    const finalConfig = loadScript(t.context);

    const config = { extends: 'invalid-extends' };

    const result = finalConfig(config, 'valid-with-invalid-extends') as IParsingError;

    t.true(result instanceof Error);
});

test('If everything is ok, it should merge all the extended configurations', (t) => {
    const sandbox = t.context.sandbox;

    sandbox.stub(t.context, 'asPathString').returns('valid-with-extends');
    sandbox.stub(t.context.path, 'resolve')
        .onFirstCall()
        .returns('valid-extends')
        .onSecondCall()
        .returns('valid-extends-2');

    const miscStub = sandbox.stub(t.context, 'loadJSONFileModule')
        .onFirstCall()
        .returns({
            extends: 'valid-extends-2',
            name: 'valid-extends'
        })
        .onSecondCall()
        .returns({
            extends: null,
            name: 'valid-extends-2'
        });

    const finalConfig = loadScript(t.context);

    const config = {
        extends: 'valid-extends',
        name: 'valid'
    };

    const result = finalConfig(config, 'valid-with-extends');

    t.true(miscStub.calledTwice);
    t.is(result && result.name, 'valid');
});
