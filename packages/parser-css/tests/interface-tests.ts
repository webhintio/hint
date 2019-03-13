import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { Engine } from 'hint';
import { ElementFound, FetchEnd } from 'hint/dist/src/lib/types';

import { StyleEvents, StyleParse } from '../src/parser';

import { mockStyleElement } from './helpers/mocks';

const mockContext = () => {

    const engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<StyleEvents>;

    const processor = {
        process: (code: string) => {
            return Promise.resolve({ root: { } });
        }
    };

    const CSSParser = proxyquire('../src/parser', {
        postcss: () => {
            return processor;
        }
    }).default;

    new CSSParser(engine); // eslint-disable-line

    return {
        engine,
        processor
    };
};

test('If a style tag is not CSS, then nothing should happen', async (t) => {
    const sandbox = sinon.createSandbox();
    const element = mockStyleElement('text/less', '');
    const resource = 'index.html';
    const { engine, processor } = mockContext();

    const postcssProcessSpy = sandbox.spy(processor, 'process');
    const elementGetAttributeSpy = sandbox.spy(element, 'getAttribute');

    await engine.emitAsync('element::style', { element, resource } as ElementFound);

    t.true(elementGetAttributeSpy.calledOnce);
    t.is(elementGetAttributeSpy.firstCall.args[0], 'type');
    t.false(postcssProcessSpy.called);

    sandbox.restore();
});

test('If a style tag is inline CSS, then we should parse the stylesheet and emit a parse::end::css event', async (t) => {
    const sandbox = sinon.createSandbox();
    const code = '.foo { color: #fff }';
    const element = mockStyleElement('text/css', code);
    const resource = 'index.html';
    const { engine, processor } = mockContext();

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');
    const postcssProcessSpy = sandbox.spy(processor, 'process');
    const elementGetAttributeSpy = sandbox.spy(element, 'getAttribute');

    await engine.emitAsync('element::style', { element, resource } as ElementFound);

    t.true(elementGetAttributeSpy.calledOnce);
    t.is(elementGetAttributeSpy.firstCall.args[0], 'type');
    t.true(postcssProcessSpy.calledOnce);
    t.is(postcssProcessSpy.firstCall.args[0], code);
    t.true(engineEmitAsyncSpy.calledThrice);

    const args = engineEmitAsyncSpy.args[2];
    const data = args[1] as StyleParse;

    t.is(args[0], 'parse::end::css');
    t.is(data.code, code);
    t.is(data.element, element);
    t.is(data.resource, resource);
});

test('If fetch::end::css is received, then we should parse the stylesheet and emit a parse::end::css event', async (t) => {
    const sandbox = sinon.createSandbox();
    const { engine, processor } = mockContext();
    const code = '.foo { color: #fff }';

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');
    const postcssProcessSpy = sandbox.spy(processor, 'process');

    await engine.emitAsync('fetch::end::css', {
        resource: 'styles.css',
        response: {
            body: { content: code },
            mediaType: 'text/css'
        }
    } as FetchEnd);

    t.true(postcssProcessSpy.calledOnce);
    t.is(postcssProcessSpy.firstCall.args[0], code);
    t.true(engineEmitAsyncSpy.calledThrice);

    const args = engineEmitAsyncSpy.thirdCall.args;
    const data = args[1] as StyleParse;

    t.is(args[0], 'parse::end::css');
    t.is(data.code, code);
    t.is(data.element, null);
    t.is(data.resource, 'styles.css');
});
