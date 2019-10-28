import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { Rule, Declaration } from 'postcss';
import { Engine } from 'hint';
import { ElementFound } from 'hint/dist/src/lib/types';

import * as CSSParser from '../src/parser';
import { StyleParse, StyleEvents } from '@hint/parser-css';

import { mockStyleElement } from './helpers/mocks';

const mockCSS = async (sandbox: sinon.SinonSandbox, lang: 'sass' | 'scss', code: string) => {

    const engine = new EventEmitter2({ delimiter: '::', maxListeners: 0, wildcard: true }) as Engine<StyleEvents>;
    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');
    const element = mockStyleElement(lang, code);
    const resource = 'index.html';

    new CSSParser.default(engine); // eslint-disable-line

    await engine.emitAsync('element::style', { element, resource } as ElementFound);

    return engineEmitAsyncSpy;
};

test('We should provide a correct AST when parsing SASS.', async (t) => {
    const code = `
$primary-color: #fff

.foo
    .bar
        color: $primary-color;
`;
    const sandbox = sinon.createSandbox();
    const engineEmitAsyncSpy = await mockCSS(sandbox, 'sass', code);

    t.is(engineEmitAsyncSpy.secondCall.args[0], 'parse::start::css');

    const args = engineEmitAsyncSpy.thirdCall.args;
    const data = args[1] as StyleParse;
    const rule = data.ast.nodes![1] as Rule;
    const subRule = rule.first as Rule;
    const declaration = subRule.first as Declaration;

    t.log(data.ast);

    t.is(args[0], 'parse::end::css');
    t.is(rule.selector, '.foo');
    t.is(subRule.selector, '.bar');
    t.is(declaration.prop, 'color');
    t.is(declaration.value, '$primary-color');
    t.is(data.code, code);
    t.is(data.resource, 'index.html');

    sandbox.restore();
});

test('We should provide a correct AST when parsing SCSS.', async (t) => {
    const code = `
$primary-color: #fff;

.foo {
    .bar {
        color: $primary-color;
    }
}
`;
    const sandbox = sinon.createSandbox();
    const engineEmitAsyncSpy = await mockCSS(sandbox, 'scss', code);

    t.is(engineEmitAsyncSpy.secondCall.args[0], 'parse::start::css');

    const args = engineEmitAsyncSpy.thirdCall.args;
    const data = args[1] as StyleParse;
    const rule = data.ast.nodes![1] as Rule;
    const subRule = rule.first as Rule;
    const declaration = subRule.first as Declaration;

    t.log(data.ast);

    t.is(args[0], 'parse::end::css');
    t.is(rule.selector, '.foo');
    t.is(subRule.selector, '.bar');
    t.is(declaration.prop, 'color');
    t.is(declaration.value, '$primary-color');
    t.is(data.code, code);
    t.is(data.resource, 'index.html');

    sandbox.restore();
});

test('We should provide an AST when parsing empty SCSS.', async (t) => {
    const code = '';
    const sandbox = sinon.createSandbox();
    const engineEmitAsyncSpy = await mockCSS(sandbox, 'scss', code);

    t.is(engineEmitAsyncSpy.secondCall.args[0], 'parse::start::css');

    const args = engineEmitAsyncSpy.thirdCall.args;
    const data = args[1] as StyleParse;

    t.is(args[0], 'parse::end::css');
    t.truthy(data.ast);

    sandbox.restore();
});
