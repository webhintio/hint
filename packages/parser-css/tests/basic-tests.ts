import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { Rule, Declaration } from 'postcss';

import { Engine } from 'hint';

import * as CSSParser from '../src/parser';
import { StyleParse, StyleEvents } from '../src/types';
import { Element, PostCss } from '../src/types';
import { ElementFound } from 'hint/dist/src/lib/types';

const postcssProcessStub: sinon.SinonStub = sinon.stub().resolves(Promise.resolve({}));
let sandbox: sinon.SinonSandbox;

const postcss: PostCss = () => {
    return { process: postcssProcessStub };
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

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();
});

test.afterEach(() => {
    sandbox.restore();
});

test('We should provide a correct AST when parsing CSS.', async (t) => {
    const engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<StyleEvents>;

    const code = '.foo { color: #fff }';
    const style = `<style>  ${code}  </style>`;
    new CSSParser.default(engine); // eslint-disable-line

    const engineEmitAsync = sandbox.spy(engine, 'emitAsync');

    sandbox.stub(element, 'outerHTML').resolves(style);
    sandbox.stub(element, 'getAttribute')
        .onFirstCall()
        .returns('text/css');

    await engine.emitAsync('element::style', { element } as ElementFound);

    t.is(engineEmitAsync.args[1][0], 'parse::start::css');

    const args = engineEmitAsync.args[2];
    const data = args[1] as StyleParse;
    const root = data.ast;
    const rule = root.first as Rule;
    const declaration = rule.first as Declaration;

    t.is(args[0], 'parse::end::css');
    t.is(rule.selector, '.foo');
    t.is(declaration.prop, 'color');
    t.is(declaration.value, '#fff');
    t.is(data.code, code);
    t.is(data.resource, 'Inline CSS');
});
