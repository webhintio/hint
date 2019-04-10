import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface, ExecutionContext } from 'ava';
import { EventEmitter2 } from 'eventemitter2';

import { ElementFound, Engine, FetchEnd } from 'hint';
import { HTMLElement } from '@hint/utils/dist/src/dom/html';

import { ScriptEvents, ScriptParse } from '../src/parser';

type Acorn = {
    parse: (code: string, options: any) => {};
    tokenizer: (code: string, options: any) => any[];
};

type AcornWalk = {
    simple: () => void;
};

type ParseJavascriptContext = {
    acorn: Acorn;
    acornWalk: AcornWalk;
    element: HTMLElement;
    engine: Engine<ScriptEvents>;
    sandbox: sinon.SinonSandbox;
};

const test = anyTest as TestInterface<ParseJavascriptContext>;

const initContext = (t: ExecutionContext<ParseJavascriptContext>) => {
    t.context.acorn = {
        parse(code: string) {
            return {};
        },
        tokenizer(code: string) {
            return [];
        }
    };
    t.context.element = {
        getAttribute(): string | null {
            return null;
        },
        innerHTML: ''
    } as any;
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<ScriptEvents>;
    t.context.acornWalk = { simple() { } };

    t.context.sandbox = sinon.createSandbox();
};

const loadScript = (context: ParseJavascriptContext) => {
    const script = proxyquire('../src/parser', {
        acorn: context.acorn,
        'acorn-walk': context.acornWalk
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

    const acornParseSpy = sandbox.spy(t.context.acorn, 'parse');
    const acornTokenizeSpy = sandbox.spy(t.context.acorn, 'tokenizer');
    const elementGetAttributeStub = sandbox.stub(t.context.element, 'getAttribute').returns('http://script.url');

    await t.context.engine.emitAsync('element::script', { element: t.context.element } as ElementFound);

    t.true(elementGetAttributeStub.calledOnce);
    t.is(elementGetAttributeStub.args[0][0], 'src');
    t.false(acornParseSpy.called);
    t.false(acornTokenizeSpy.called);
});

test('If an script tag is not a javascript, then nothing should happen', async (t) => {
    const sandbox = t.context.sandbox;
    const JavascriptParser = loadScript(t.context);

    new JavascriptParser(t.context.engine); // eslint-disable-line

    const acornParseSpy = sandbox.spy(t.context.acorn, 'parse');
    const acornTokenizeSpy = sandbox.spy(t.context.acorn, 'tokenizer');
    const elementGetAttributeStub = sandbox.stub(t.context.element, 'getAttribute')
        .onFirstCall()
        .returns(null)
        .onSecondCall()
        .returns('text/x-handlebars-template');

    await t.context.engine.emitAsync('element::script', { element: t.context.element } as ElementFound);

    t.true(elementGetAttributeStub.calledTwice);
    t.is(elementGetAttributeStub.args[0][0], 'src');
    t.is(elementGetAttributeStub.args[1][0], 'type');
    t.false(acornParseSpy.called);
    t.false(acornTokenizeSpy.called);
});

test('If an script tag is an internal javascript, then we should parse the code and emit a parse::end::javascript event', async (t) => {
    const sandbox = t.context.sandbox;
    const parseObject = {};
    const tokenList: any[] = ['test'];
    const code = 'var x = 8;';
    const JavascriptParser = loadScript(t.context);
    const resource = 'index.html';

    new JavascriptParser(t.context.engine); // eslint-disable-line

    const engineEmitAsyncSpy = sandbox.spy(t.context.engine, 'emitAsync');
    const acornParseStub = sandbox.stub(t.context.acorn, 'parse').returns(parseObject);
    const acornTokenizeStub = sandbox.stub(t.context.acorn, 'tokenizer').returns(tokenList);

    sandbox.stub(t.context.element, 'innerHTML').value(code);
    const elementGetAttributeStub = sandbox.stub(t.context.element, 'getAttribute')
        .onFirstCall()
        .returns(null)
        .onSecondCall()
        .returns('text/javascript');

    await t.context.engine.emitAsync('element::script', { element: t.context.element, resource } as ElementFound);

    t.true(elementGetAttributeStub.calledTwice);
    t.is(elementGetAttributeStub.args[0][0], 'src');
    t.is(elementGetAttributeStub.args[1][0], 'type');
    t.true(acornParseStub.calledOnce);
    t.is(acornParseStub.args[0][0], code);
    t.true(acornTokenizeStub.calledOnce);
    t.is(acornTokenizeStub.args[0][0], code);
    t.true(engineEmitAsyncSpy.calledThrice);

    t.is(engineEmitAsyncSpy.args[1][0], 'parse::start::javascript');

    const args = engineEmitAsyncSpy.args[2];
    const data = args[1] as ScriptParse;

    t.is(args[0], 'parse::end::javascript');
    t.is(data.element, t.context.element);
    t.is(data.resource, resource);
    t.is(data.ast, parseObject);
    t.is(data.tokens[0], tokenList[0]);
});

test('If fetch::end::script is received, then we should parse the code and emit a parse::end::javascript event', async (t) => {
    const sandbox = t.context.sandbox;
    const parseObject = {};
    const tokenList: any[] = ['test'];
    const code = 'var x = 8;';
    const JavascriptParser = loadScript(t.context);

    new JavascriptParser(t.context.engine); // eslint-disable-line

    const engineEmitAsyncSpy = sandbox.spy(t.context.engine, 'emitAsync');
    const acornParseStub = sandbox.stub(t.context.acorn, 'parse').returns(parseObject);
    const acornTokenizeStub = sandbox.stub(t.context.acorn, 'tokenizer').returns(tokenList);

    await t.context.engine.emitAsync('fetch::end::script', {
        resource: 'script.js',
        response: {
            body: { content: code },
            mediaType: 'text/javascript'
        }
    } as FetchEnd);

    t.true(acornParseStub.calledOnce);
    t.is(acornParseStub.args[0][0], code);
    t.true(acornTokenizeStub.calledOnce);
    t.is(acornTokenizeStub.args[0][0], code);
    t.true(engineEmitAsyncSpy.calledThrice);

    t.is(engineEmitAsyncSpy.args[1][0], 'parse::start::javascript');

    const args = engineEmitAsyncSpy.args[2];
    const data = args[1] as ScriptParse;

    t.is(args[0], 'parse::end::javascript');
    t.is(data.element, null);
    t.is(data.ast, parseObject);
    t.is(data.resource, 'script.js');
    t.is(data.tokens[0], tokenList[0]);
});

test('If the tree walked is always the same, acorn-walk will be called just once', async (t) => {
    const sandbox = t.context.sandbox;
    const parseObject = {};
    const tokenList: any[] = ['test'];
    const code = 'var x = 8;';
    const JavascriptParser = loadScript(t.context);

    new JavascriptParser(t.context.engine); // eslint-disable-line

    sandbox.stub(t.context.acorn, 'parse').returns(parseObject);
    sandbox.stub(t.context.acorn, 'tokenizer').returns(tokenList);
    const walkSimpleSpy = sandbox.spy(t.context.acornWalk, 'simple');

    t.context.engine.on('parse::end::javascript', (data: ScriptParse) => {
        data.walk.simple(data.ast, {
            CallExpression(node) {
            }
        });

        data.walk.simple(data.ast, {
            CallExpression(node) {
            }
        });
    });

    await t.context.engine.emitAsync('fetch::end::script', {
        resource: 'script.js',
        response: {
            body: { content: code },
            mediaType: 'text/javascript'
        }
    } as FetchEnd);

    t.true(walkSimpleSpy.calledOnce);
});

test('acorn-walk will be called once per javascript file', async (t) => {
    const sandbox = t.context.sandbox;
    const parseObject = {};
    const tokenList: any[] = ['test'];
    const code = 'var x = 8;';
    const JavascriptParser = loadScript(t.context);

    new JavascriptParser(t.context.engine); // eslint-disable-line

    sandbox.stub(t.context.acorn, 'parse').returns(parseObject);
    sandbox.stub(t.context.acorn, 'tokenizer').returns(tokenList);
    const walkSimpleSpy = sandbox.spy(t.context.acornWalk, 'simple');

    t.context.engine.on('parse::end::javascript', (data: ScriptParse) => {
        data.walk.simple(data.ast, {
            CallExpression(node) {
            }
        });
    });

    await t.context.engine.emitAsync('fetch::end::script', {
        resource: 'script.js',
        response: {
            body: { content: code },
            mediaType: 'text/javascript'
        }
    } as FetchEnd);

    await t.context.engine.emitAsync('fetch::end::script', {
        resource: 'script2.js',
        response: {
            body: { content: code },
            mediaType: 'text/javascript'
        }
    } as FetchEnd);

    t.true(walkSimpleSpy.calledTwice);
});
