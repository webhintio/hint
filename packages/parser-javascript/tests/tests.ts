import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface, ExecutionContext } from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { Engine } from 'hint';
import { ElementFound, IAsyncHTMLElement, FetchEnd } from 'hint/dist/src/lib/types';

import { ScriptEvents, ScriptParse } from '../src/parser';

type ESlint = {
    SourceCode: (code: string, parseObject: {}) => {};
};

type Espree = {
    parse: (code: string) => {};
};

type ParseJavascriptContext = {
    element: IAsyncHTMLElement;
    engine: Engine<ScriptEvents>;
    eslint: ESlint;
    espree: Espree;
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<ParseJavascriptContext>;

const initContext = (t: ExecutionContext<ParseJavascriptContext>) => {
    t.context.eslint = {
        SourceCode(code: string, parseObject: {}) {
            return {};
        }
    };
    t.context.espree = {
        parse(code: string) {
            return {};
        }
    };
    t.context.element = {
        getAttribute(): string | null {
            return null;
        },
        outerHTML(): Promise<string> {
            return Promise.resolve('');
        }
    } as any;
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<ScriptEvents>;

    t.context.sandbox = sinon.createSandbox();
};

const loadScript = (context: ParseJavascriptContext) => {
    const script = proxyquire('../src/parser', {
        // eslint-disable-next-line
        'eslint/lib/util/source-code': function (...args: any[]) {
            return Reflect.construct(context.eslint.SourceCode, args, new.target);
        },
        espree: context.espree
    });

    return script.default;
};

test.beforeEach(initContext);

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('If an script tag is an external javascript, then nothing happen', async (t) => {
    const sandbox = t.context.sandbox;
    const JavascriptParser = loadScript(t.context);

    new JavascriptParser(t.context.engine); // eslint-disable-line

    const eslintSourceCodeSpy = sandbox.spy(t.context.eslint, 'SourceCode');
    const espreeParseSpy = sandbox.spy(t.context.espree, 'parse');
    const elementGetAttributeStub = sandbox.stub(t.context.element, 'getAttribute').returns('http://script.url');

    await t.context.engine.emitAsync('element::script', { element: t.context.element } as ElementFound);

    t.true(elementGetAttributeStub.calledOnce);
    t.is(elementGetAttributeStub.args[0][0], 'src');
    t.false(espreeParseSpy.called);
    t.false(eslintSourceCodeSpy.called);
});

test('If an script tag is not a javascript, then nothing should happen', async (t) => {
    const sandbox = t.context.sandbox;
    const JavascriptParser = loadScript(t.context);

    new JavascriptParser(t.context.engine); // eslint-disable-line

    const eslintSourceCodeSpy = sandbox.spy(t.context.eslint, 'SourceCode');
    const espreeParseSpy = sandbox.spy(t.context.espree, 'parse');
    const elementGetAttributeStub = sandbox.stub(t.context.element, 'getAttribute')
        .onFirstCall()
        .returns(null)
        .onSecondCall()
        .returns('text/x-handlebars-template');

    await t.context.engine.emitAsync('element::script', { element: t.context.element } as ElementFound);

    t.true(elementGetAttributeStub.calledTwice);
    t.is(elementGetAttributeStub.args[0][0], 'src');
    t.is(elementGetAttributeStub.args[1][0], 'type');
    t.false(espreeParseSpy.called);
    t.false(eslintSourceCodeSpy.called);
});

test('If an script tag is an internal javascript, then we should parse the code and emit a parse::end::javascript event', async (t) => {
    const sandbox = t.context.sandbox;
    const parseObject = {};
    const sourceCodeObject = {};
    const code = 'var x = 8;';
    const script = `<script>  ${code}  </script>`;
    const JavascriptParser = loadScript(t.context);

    new JavascriptParser(t.context.engine); // eslint-disable-line

    const engineEmitAsyncSpy = sandbox.spy(t.context.engine, 'emitAsync');
    const eslintSourceCodeStub = sandbox.stub(t.context.eslint, 'SourceCode').returns(sourceCodeObject);
    const espreeParseStub = sandbox.stub(t.context.espree, 'parse').returns(parseObject);

    sandbox.stub(t.context.element, 'outerHTML').resolves(script);
    const elementGetAttributeStub = sandbox.stub(t.context.element, 'getAttribute')
        .onFirstCall()
        .returns(null)
        .onSecondCall()
        .returns('text/javascript');

    await t.context.engine.emitAsync('element::script', { element: t.context.element } as ElementFound);

    t.true(elementGetAttributeStub.calledTwice);
    t.is(elementGetAttributeStub.args[0][0], 'src');
    t.is(elementGetAttributeStub.args[1][0], 'type');
    t.true(espreeParseStub.calledOnce);
    t.is(espreeParseStub.args[0][0], code);
    t.true(eslintSourceCodeStub.calledOnce);
    t.is(eslintSourceCodeStub.args[0][0], code);
    t.is(eslintSourceCodeStub.args[0][1], parseObject);
    t.true(engineEmitAsyncSpy.calledThrice);

    t.is(engineEmitAsyncSpy.args[1][0], 'parse::start::javascript');

    const args = engineEmitAsyncSpy.args[2];
    const data = args[1] as ScriptParse;

    t.is(args[0], 'parse::end::javascript');
    t.is(data.element, t.context.element);
    t.is(data.resource, 'Internal javascript');
    t.is(data.sourceCode, sourceCodeObject);
});

test('If fetch::end::script is received, then we should parse the code and emit a parse::end::javascript event', async (t) => {
    const sandbox = t.context.sandbox;
    const parseObject = {};
    const sourceCodeObject = {};
    const code = 'var x = 8;';
    const JavascriptParser = loadScript(t.context);

    new JavascriptParser(t.context.engine); // eslint-disable-line

    const engineEmitAsyncSpy = sandbox.spy(t.context.engine, 'emitAsync');
    const eslintSourceCodeStub = sandbox.stub(t.context.eslint, 'SourceCode').returns(sourceCodeObject);
    const espreeParseStub = sandbox.stub(t.context.espree, 'parse').returns(parseObject);

    await t.context.engine.emitAsync('fetch::end::script', {
        resource: 'script.js',
        response: {
            body: { content: code },
            mediaType: 'text/javascript'
        }
    } as FetchEnd);

    t.true(espreeParseStub.calledOnce);
    t.is(espreeParseStub.args[0][0], code);
    t.true(eslintSourceCodeStub.calledOnce);
    t.is(eslintSourceCodeStub.args[0][0], code);
    t.is(eslintSourceCodeStub.args[0][1], parseObject);
    t.true(engineEmitAsyncSpy.calledThrice);

    t.is(engineEmitAsyncSpy.args[1][0], 'parse::start::javascript');

    const args = engineEmitAsyncSpy.args[2];
    const data = args[1] as ScriptParse;

    t.is(args[0], 'parse::end::javascript');
    t.is(data.element, null);
    t.is(data.sourceCode, sourceCodeObject);
    t.is(data.resource, 'script.js');
});
