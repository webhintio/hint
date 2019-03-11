import anyTest, { TestInterface, ExecutionContext } from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import { EventEmitter2 } from 'eventemitter2';

import { ExtendableConfiguration } from '../../../src/lib/types/parser';
import { Events } from '../../../src/lib/types';
import { Engine } from '../../../src/lib/engine';

type FileModule = {
    extends: string | null;
    name: string;
};

type LoadJSONFileModule = {
    loadJSONFile: () => FileModule | null;
};

type AsPathString = {
    default: () => string;
};

type Path = {
    dirname: () => string;
    resolve: () => string;
};

type ParserContext = {
    asPathString: AsPathString;
    engine: Engine<Events>;
    loadJSONFileModule: LoadJSONFileModule;
    path: Path;
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<ParserContext>;

const asUri = { getAsUri() { } };

interface ITestConfig extends ExtendableConfiguration {
    name?: string;
}

const initContext = (t: ExecutionContext<ParserContext>) => {
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<Events>;

    t.context.loadJSONFileModule = {
        loadJSONFile(): FileModule | null {
            return null;
        }
    };

    t.context.asPathString = {
        default(): string {
            return '';
        }
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
    const script = proxyquire('../../../src/lib/types/parser', {
        '../utils/fs/load-json-file': context.loadJSONFileModule,
        '../utils/network/as-path-string': context.asPathString,
        '../utils/network/as-uri': asUri,
        path: context.path
    });

    return script.Parser;
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test(`If config doesn't have an extends property, it should return the same object`, async (t) => {
    const Parser = loadScript(t.context);
    const config = { extends: '' };

    class TestParser extends Parser {
        public constructor(engine: Engine) {
            super(engine, 'test');
        }

        public config(config: ITestConfig, resource: string) {
            return this.finalConfig(config, resource);
        }
    }

    const testParser = new TestParser(t.context.engine);

    const result = await testParser.config(config, 'resource');

    t.true(config === result);
});

test('If there is a circular reference, it should return an instance of an Error', async (t) => {
    const sandbox = t.context.sandbox;
    const Parser = loadScript(t.context);

    class TestParser extends Parser {
        public constructor(engine: Engine) {
            super(engine, 'test');
        }

        public config(config: ITestConfig, resource: string) {
            return this.finalConfig(config, resource);
        }
    }

    const config = { extends: 'circularReference' };

    sandbox.stub(t.context.asPathString, 'default').returns('circularReference');
    sandbox.stub(t.context.path, 'resolve').returns('circularReference');

    const testParser = new TestParser(t.context.engine);
    const result = await testParser.config(config, 'circularReference');

    t.true(result instanceof Error);
    t.is(result.message, 'Circular reference found in file circularReference');
});

test('If one of the extended files is no a valid JSON, it should return an instance of an Error', async (t) => {
    const sandbox = t.context.sandbox;
    const Parser = loadScript(t.context);

    class TestParser extends Parser {
        public constructor(engine: Engine) {
            super(engine, 'test');
        }

        public config(config: ITestConfig, resource: string) {
            return this.finalConfig(config, resource);
        }
    }

    const config = { extends: 'invalid-extends' };

    sandbox.stub(t.context.asPathString, 'default').returns('valid-with-invalid-extends');
    sandbox.stub(t.context.path, 'resolve').returns('invalid-extends');
    sandbox.stub(t.context.loadJSONFileModule, 'loadJSONFile').throws(new Error('InvalidJSON'));

    const testParser = new TestParser(t.context.engine);
    const result = await testParser.config(config, 'valid-with-invalid-extends');

    t.true(result instanceof Error);
});

test('If everything is ok, it should merge all the extended configurations', async (t) => {
    const sandbox = t.context.sandbox;
    const Parser = loadScript(t.context);

    class TestParser extends Parser {
        public constructor(engine: Engine) {
            super(engine, 'test');
        }

        public config(config: ITestConfig, resource: string) {
            return this.finalConfig(config, resource);
        }
    }

    const config = {
        extends: 'valid-extends',
        name: 'valid'
    };

    sandbox.stub(t.context.asPathString, 'default').returns('valid-with-extends');
    sandbox.stub(t.context.path, 'resolve')
        .onFirstCall()
        .returns('valid-extends')
        .onSecondCall()
        .returns('valid-extends-2');

    const miscStub = sandbox.stub(t.context.loadJSONFileModule, 'loadJSONFile')
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

    sandbox.spy(t.context.engine, 'emitAsync');

    const testParser = new TestParser(t.context.engine);

    const result = await testParser.config(config, 'valid-with-extends');

    t.true(miscStub.calledTwice);
    t.is(result && result.name, 'valid');
});
