import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface } from 'ava';
import { EventEmitter2 } from 'eventemitter2';

import { Engine } from 'hint';
import { ElementFound, FetchEnd } from 'hint/dist/src/lib/types';

import { PostCss, StyleEvents, InterfaceTestContext, StyleParse, Element } from '../src/parser';

const postcssProcessStub : sinon.SinonStub = sinon.stub().resolves(Promise.resolve({}));

const postcss: PostCss = () => {
    return {
        process: postcssProcessStub
    };
};

const element: Element = {
    getAttribute(): string | null {
        return null;
    },
    outerHTML(): Promise<string> {
        return Promise.resolve('');
    }
};

proxyquire('../src/parser', { postcss });

import * as CSSParser from '../src/parser';

const test = anyTest as TestInterface<InterfaceTestContext>;
let sandbox: sinon.SinonSandbox;
let engineEmitAsyncSpy: sinon.SinonSpy;

test.beforeEach((t) => {
    (t.context as any).postcss = postcss();
    (t.context as any).element = element;
    (t.context as any).engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<StyleEvents>;
});

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();
    new CSSParser.default((t.context as any).engine); // eslint-disable-line

    engineEmitAsyncSpy = sandbox.spy(t.context.engine, 'emitAsync');
});

test.afterEach(() => {
    postcssProcessStub.resetHistory();
    sandbox.restore();
});

test.serial('If a style tag is not CSS, then nothing should happen', async (t) => {
    const elementGetAttributeStub = sandbox.stub(element, 'getAttribute')
        .onFirstCall()
        .returns('text/less');

    await (t.context as any).engine.emitAsync('element::style', { element });

    t.true(elementGetAttributeStub.calledOnce);
    t.is(elementGetAttributeStub.args[0][0], 'type');
    t.false(postcssProcessStub.called);
});

test.serial('If a style tag is inline CSS, then we should parse the stylesheet and emit a parse::end::css event', async (t) => {
    const code = '.foo { color: #fff }';
    const style = `<style>  ${code}  </style>`;

    sandbox.stub(element, 'outerHTML').resolves(style);
    const elementGetAttributeStub = sandbox.stub(element, 'getAttribute')
        .onFirstCall()
        .returns('text/css');

    await t.context.engine.emitAsync('element::style', { element } as ElementFound);

    t.true(elementGetAttributeStub.calledOnce);
    t.is(elementGetAttributeStub.args[0][0], 'type');
    t.true(postcssProcessStub.calledOnce);
    t.is(postcssProcessStub.args[0][0], code);
    t.true(engineEmitAsyncSpy.calledThrice);

    const args = engineEmitAsyncSpy.args[2];
    const data = args[1] as StyleParse;

    t.is(args[0], 'parse::end::css');
    t.is(data.code, code);
    t.is(data.resource, 'Inline CSS');
});

test.serial('If fetch::end::css is received, then we should parse the stylesheet and emit a parse::end::css event', async (t) => {
    const code = '.foo { color: #fff }';

    await (t.context as any).engine.emitAsync('fetch::end::css', {
        resource: 'styles.css',
        response: {
            body: { content: code },
            mediaType: 'text/css'
        }
    } as FetchEnd);

    t.true(postcssProcessStub.calledOnce);
    t.is(postcssProcessStub.args[0][0], code);
    t.true(engineEmitAsyncSpy.calledThrice);

    const args = engineEmitAsyncSpy.args[2];
    const data = args[1] as StyleParse;

    t.is(args[0], 'parse::end::css');
    t.is(data.code, code);
    t.is(data.resource, 'styles.css');
});
