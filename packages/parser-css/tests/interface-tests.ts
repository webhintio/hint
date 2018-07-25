import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';

const postcss = { parse() { } };
const element = { getAttribute() { }, outerHTML() { } };

proxyquire('../src/parser', { postcss });

import * as CSSParser from '../src/parser';

test.beforeEach((t) => {
    t.context.postcss = postcss;
    t.context.element = element;
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
});

test.serial('If a style tag is not CSS, then nothing should happen', async (t) => {
    const sandbox = sinon.createSandbox();
    const parser = new CSSParser.default(t.context.engine); // eslint-disable-line new-cap,no-unused-vars

    sandbox.spy(postcss, 'parse');
    sandbox.stub(element, 'getAttribute')
        .onFirstCall()
        .returns('text/less');

    await t.context.engine.emitAsync('element::style', { element });

    t.true(t.context.element.getAttribute.calledOnce);
    t.is(t.context.element.getAttribute.args[0][0], 'type');
    t.false(t.context.postcss.parse.called);

    sandbox.restore();
});

test.serial('If a style tag is inline CSS, then we should parse the stylesheet and emit a parse::css::end event', async (t) => {
    const sandbox = sinon.createSandbox();
    const parser = new CSSParser.default(t.context.engine); // eslint-disable-line new-cap,no-unused-vars
    const parseObject = {};
    const code = '.foo { color: #fff }';
    const style = `<style>  ${code}  </style>`;

    sandbox.spy(t.context.engine, 'emitAsync');
    sandbox.stub(postcss, 'parse').returns(parseObject);

    sandbox.stub(element, 'outerHTML').resolves(style);
    sandbox.stub(element, 'getAttribute')
        .onFirstCall()
        .returns('text/css');

    await t.context.engine.emitAsync('element::style', { element });

    t.true(t.context.element.getAttribute.calledOnce);
    t.is(t.context.element.getAttribute.args[0][0], 'type');
    t.true(t.context.postcss.parse.calledOnce);
    t.is(t.context.postcss.parse.args[0][0], code);
    t.true(t.context.engine.emitAsync.calledTwice);

    const args = t.context.engine.emitAsync.args[1];

    t.is(args[0], 'parse::css::end');
    t.is(args[1].code, code);
    t.is(args[1].resource, 'Inline CSS');

    sandbox.restore();
});


test.serial('If fetch::end::css is received, then we should parse the stylesheet and emit a parse::css::end event', async (t) => {
    const sandbox = sinon.createSandbox();
    const parser = new CSSParser.default(t.context.engine); // eslint-disable-line new-cap,no-unused-vars
    const parseObject = {};
    const code = '.foo { color: #fff }';

    sandbox.spy(t.context.engine, 'emitAsync');
    sandbox.stub(postcss, 'parse').returns(parseObject);

    await t.context.engine.emitAsync('fetch::end::css', {
        resource: 'styles.css',
        response: {
            body: { content: code },
            mediaType: 'text/css'
        }
    });

    t.true(t.context.postcss.parse.calledOnce);
    t.is(t.context.postcss.parse.args[0][0], code);
    t.true(t.context.engine.emitAsync.calledTwice);

    const args = t.context.engine.emitAsync.args[1];

    t.is(args[0], 'parse::css::end');
    t.is(args[1].code, code);
    t.is(args[1].resource, 'styles.css');

    sandbox.restore();
});
