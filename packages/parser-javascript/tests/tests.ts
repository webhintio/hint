import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface } from 'ava';
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

const eslint: ESlint = {
    SourceCode(code: string, parseObject: {}) {
        return {};
    }
};
const espree: Espree = {
    parse(code: string) {
        return {};
    }
};
const element: IAsyncHTMLElement = {
    getAttribute(): string | null {
        return null;
    },
    outerHTML(): Promise<string> {
        return Promise.resolve('');
    }
} as any;

type ParseJavascriptContext = {
    eslint: ESlint;
    espree: Espree;
    element: IAsyncHTMLElement;
    engine: Engine<ScriptEvents>;
};

const test = anyTest as TestInterface<ParseJavascriptContext>;

proxyquire('../src/parser', {
    // eslint-disable-next-line
    'eslint/lib/util/source-code': function (...args: any[]) {
        return Reflect.construct(eslint.SourceCode, args, new.target);
    },
    espree
});

import * as JavascriptParser from '../src/parser';

test.beforeEach((t) => {
    t.context.eslint = eslint;
    t.context.espree = espree;
    t.context.element = element;
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<ScriptEvents>;
});

test.serial('If an script tag is an external javascript, then nothing happen', async (t) => {
    const sandbox = sinon.createSandbox();
    new JavascriptParser.default(t.context.engine); // eslint-disable-line

    const eslintSourceCodeSpy = sandbox.spy(eslint, 'SourceCode');
    const espreeParseSpy = sandbox.spy(espree, 'parse');
    const elementGetAttributeStub = sandbox.stub(element, 'getAttribute').returns('http://script.url');

    await t.context.engine.emitAsync('element::script', { element } as ElementFound);

    t.true(elementGetAttributeStub.calledOnce);
    t.is(elementGetAttributeStub.args[0][0], 'src');
    t.false(espreeParseSpy.called);
    t.false(eslintSourceCodeSpy.called);

    sandbox.restore();
});

test.serial('If an script tag is not a javascript, then nothing should happen', async (t) => {
    const sandbox = sinon.createSandbox();
    new JavascriptParser.default(t.context.engine); // eslint-disable-line

    const eslintSourceCodeSpy = sandbox.spy(eslint, 'SourceCode');
    const espreeParseSpy = sandbox.spy(espree, 'parse');
    const elementGetAttributeStub = sandbox.stub(element, 'getAttribute')
        .onFirstCall()
        .returns(null)
        .onSecondCall()
        .returns('text/x-handlebars-template');

    await t.context.engine.emitAsync('element::script', { element } as ElementFound);

    t.true(elementGetAttributeStub.calledTwice);
    t.is(elementGetAttributeStub.args[0][0], 'src');
    t.is(elementGetAttributeStub.args[1][0], 'type');
    t.false(espreeParseSpy.called);
    t.false(eslintSourceCodeSpy.called);

    sandbox.restore();
});

test.serial('If an script tag is an internal javascript, then we should parse the code and emit a parse::end::javascript event', async (t) => {
    const sandbox = sinon.createSandbox();
    const parseObject = {};
    const sourceCodeObject = {};
    const code = 'var x = 8;';
    const script = `<script>  ${code}  </script>`;
    new JavascriptParser.default(t.context.engine); // eslint-disable-line

    const engineEmitAsyncSpy = sandbox.spy(t.context.engine, 'emitAsync');
    const eslintSourceCodeStub = sandbox.stub(eslint, 'SourceCode').returns(sourceCodeObject);
    const espreeParseStub = sandbox.stub(espree, 'parse').returns(parseObject);

    sandbox.stub(element, 'outerHTML').resolves(script);
    const elementGetAttributeStub = sandbox.stub(element, 'getAttribute')
        .onFirstCall()
        .returns(null)
        .onSecondCall()
        .returns('text/javascript');

    await t.context.engine.emitAsync('element::script', { element } as ElementFound);

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
    t.is(data.resource, 'Internal javascript');
    t.is(data.sourceCode, sourceCodeObject);

    sandbox.restore();
});

test.serial('If fetch::end::script is received, then we should parse the code and emit a parse::end::javascript event', async (t) => {
    const sandbox = sinon.createSandbox();
    const parseObject = {};
    const sourceCodeObject = {};
    const code = 'var x = 8;';
    new JavascriptParser.default(t.context.engine); // eslint-disable-line

    const engineEmitAsyncSpy = sandbox.spy(t.context.engine, 'emitAsync');
    const eslintSourceCodeStub = sandbox.stub(eslint, 'SourceCode').returns(sourceCodeObject);
    const espreeParseStub = sandbox.stub(espree, 'parse').returns(parseObject);

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
    t.is(data.sourceCode, sourceCodeObject);
    t.is(data.resource, 'script.js');

    sandbox.restore();
});
