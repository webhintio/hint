import * as sinon from 'sinon';
import anyTest, { TestInterface } from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import * as postcss from 'postcss';
import { Rule, Declaration } from 'postcss';

import { Engine } from 'hint';
import { FetchEnd } from 'hint/dist/src/lib/types';

import CSSParser, { StyleEvents } from '../src/parser';
import { InterfaceTestContext, Element } from '../src/types';

const element: Element = {
    getAttribute(): string | null {
        return null;
    },
    outerHTML(): Promise<string> {
        return Promise.resolve('');
    }
};

const fireAndWaitForEmitAsync = async (t: any, code: string) => {
    await t.context.engine.emitAsync('fetch::end::css', {
        resource: 'styles.css',
        response: {
            body: { content: code },
            mediaType: 'text/css'
        }
    } as FetchEnd);

    return t.context.engine.emitAsync.args[2];
};

const test = anyTest as TestInterface<InterfaceTestContext>;

let sandbox: sinon.SinonSandbox;

test.beforeEach((t) => {
    t.context.element = element;
    t.context.postcss = postcss();
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<StyleEvents>;

    sandbox = sinon.createSandbox();
    sandbox.spy(t.context.engine, 'emitAsync');

    new CSSParser(t.context.engine); // eslint-disable-line
});

test.afterEach(() => {
    sandbox.restore();
});

test.serial('If a wellformed CSS file is provided, then we should emit a parse::end::css event', async (t) => {
    const code = '.foo { color: #fff }';
    const [eventName] = await fireAndWaitForEmitAsync(t, code);

    t.is(eventName, 'parse::end::css');
});

test.serial('If a wellformed CSS file is provided, then we should provide a correct AST when parsing CSS', async (t) => {
    const code = '.foo { color: #fff }';
    const [, { ast }] = await fireAndWaitForEmitAsync(t, code);
    const nodes = ast.nodes;
    const rule = nodes[0] as Rule;
    const declaration = rule.first as Declaration;

    t.is(nodes.length, 1);
    t.not(declaration, undefined);
});

test.serial('If a malformed CSS code is provided, then we should emit a parse::end::css event', async (t) => {
    const code = '.foo { color: #fff } a {';
    const [eventName] = await fireAndWaitForEmitAsync(t, code);

    t.is(eventName, 'parse::end::css');
});

test.serial('If a malformed CSS code is provided, then we should provide a correct AST when parsing CSS', async (t) => {
    const code = '.foo { color: #fff } a {';
    const [, { ast }] = await fireAndWaitForEmitAsync(t, code);
    const nodes = ast.nodes;
    const rule = nodes[1] as Rule;
    const declaration = rule.first as Declaration;

    t.is(nodes.length, 2);
    t.is(declaration, undefined);
});
