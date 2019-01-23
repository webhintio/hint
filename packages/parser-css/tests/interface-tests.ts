import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import anyTest, { TestInterface } from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { Engine } from 'hint';

import { StyleEvents, StyleParse } from '../src/parser';

type PostCss = {
    parse: (input: string) => {};
};

type Element = {
    getAttribute: () => string | null;
    outerHTML: () => Promise<string>;
};

type InterfaceTestContext = {
    postcss: PostCss;
    element: Element;
    engine: Engine<StyleEvents>;
};

const test = anyTest as TestInterface<InterfaceTestContext>;

const postcss: PostCss = {
    parse(input: string) {
        return {};
    }
};

const element = {
    getAttribute(): string | null {
        return null;
    },
    outerHTML(): Promise<string> {
        return Promise.resolve('');
    }
} as any;

proxyquire('../src/parser', { postcss });

import * as CSSParser from '../src/parser';
import { ElementFound, FetchEnd } from 'hint/dist/src/lib/types';

test.beforeEach((t) => {
    t.context.postcss = postcss;
    t.context.element = element;
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<StyleEvents>;
});

test.serial('If a style tag is not CSS, then nothing should happen', async (t) => {
    const sandbox = sinon.createSandbox();
    new CSSParser.default(t.context.engine); // eslint-disable-line

    const postcssParseSpy = sandbox.spy(postcss, 'parse');
    const elementGetAttributeStub = sandbox.stub(element, 'getAttribute')
        .onFirstCall()
        .returns('text/less');

    await t.context.engine.emitAsync('element::style', { element } as ElementFound);

    t.true(elementGetAttributeStub.calledOnce);
    t.is(elementGetAttributeStub.args[0][0], 'type');
    t.false(postcssParseSpy.called);

    sandbox.restore();
});

test.serial('If a style tag is inline CSS, then we should parse the stylesheet and emit a parse::end::css event', async (t) => {
    const sandbox = sinon.createSandbox();
    const parseObject = {};
    const code = '.foo { color: #fff }';
    const style = `<style>  ${code}  </style>`;
    new CSSParser.default(t.context.engine); // eslint-disable-line

    const engineEmitAsyncSpy = sandbox.spy(t.context.engine, 'emitAsync');
    const postcssParseStub = sandbox.stub(postcss, 'parse').returns(parseObject);

    sandbox.stub(element, 'outerHTML').resolves(style);
    const elementGetAttributeStub = sandbox.stub(element, 'getAttribute')
        .onFirstCall()
        .returns('text/css');

    await t.context.engine.emitAsync('element::style', { element } as ElementFound);

    t.true(elementGetAttributeStub.calledOnce);
    t.is(elementGetAttributeStub.args[0][0], 'type');
    t.true(postcssParseStub.calledOnce);
    t.is(postcssParseStub.args[0][0], code);
    t.true(engineEmitAsyncSpy.calledThrice);

    const args = engineEmitAsyncSpy.args[2];
    const data = args[1] as StyleParse;

    t.is(args[0], 'parse::end::css');
    t.is(data.code, code);
    t.is(data.resource, 'Inline CSS');

    sandbox.restore();
});

test.serial('If fetch::end::css is received, then we should parse the stylesheet and emit a parse::end::css event', async (t) => {
    const sandbox = sinon.createSandbox();
    const parseObject = {};
    const code = '.foo { color: #fff }';
    new CSSParser.default(t.context.engine); // eslint-disable-line

    const engineEmitAsyncSpy = sandbox.spy(t.context.engine, 'emitAsync');
    const postcssParseStub = sandbox.stub(postcss, 'parse').returns(parseObject);

    await t.context.engine.emitAsync('fetch::end::css', {
        resource: 'styles.css',
        response: {
            body: { content: code },
            mediaType: 'text/css'
        }
    } as FetchEnd);

    t.true(postcssParseStub.calledOnce);
    t.is(postcssParseStub.args[0][0], code);
    t.true(engineEmitAsyncSpy.calledThrice);

    const args = engineEmitAsyncSpy.args[2];
    const data = args[1] as StyleParse;

    t.is(args[0], 'parse::end::css');
    t.is(data.code, code);
    t.is(data.resource, 'styles.css');

    sandbox.restore();
});
