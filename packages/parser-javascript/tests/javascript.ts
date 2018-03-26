import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';

const eslint = { SourceCode() { } };
const espree = { parse() { } };
const element = { getAttribute() { }, outerHTML() { } };

proxyquire('../src/javascript', {
    eslint,
    espree
});

import * as JavascriptParser from '../src/javascript';

test.beforeEach((t) => {
    t.context.eslint = eslint;
    t.context.espree = espree;
    t.context.element = element;
    t.context.sonarwhal = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
});

test.serial('If an script tag is an external javascript, then nothing happen', async (t) => {
    const sandbox = sinon.sandbox.create();
    const parser = new JavascriptParser.default(t.context.sonarwhal); // eslint-disable-line new-cap,no-unused-vars

    sandbox.spy(eslint, 'SourceCode');
    sandbox.spy(espree, 'parse');
    sandbox.stub(element, 'getAttribute').returns('http://script.url');

    await t.context.sonarwhal.emitAsync('element::script', { element });

    t.true(t.context.element.getAttribute.calledOnce);
    t.is(t.context.element.getAttribute.args[0][0], 'src');
    t.false(t.context.espree.parse.called);
    t.false(t.context.eslint.SourceCode.called);

    sandbox.restore();
});

test.serial('If an script tag is not a javascript, then nothing should happen', async (t) => {
    const sandbox = sinon.sandbox.create();
    const parser = new JavascriptParser.default(t.context.sonarwhal); // eslint-disable-line new-cap,no-unused-vars

    sandbox.spy(eslint, 'SourceCode');
    sandbox.spy(espree, 'parse');
    sandbox.stub(element, 'getAttribute')
        .onFirstCall()
        .returns(null)
        .onSecondCall()
        .returns('text/x-handlebars-template');

    await t.context.sonarwhal.emitAsync('element::script', { element });

    t.true(t.context.element.getAttribute.calledTwice);
    t.is(t.context.element.getAttribute.args[0][0], 'src');
    t.is(t.context.element.getAttribute.args[1][0], 'type');
    t.false(t.context.espree.parse.called);
    t.false(t.context.eslint.SourceCode.called);

    sandbox.restore();
});

test.serial('If an script tag is an internal javascript, then we should parse the code and emit a parser::javascript::end event', async (t) => {
    const sandbox = sinon.sandbox.create();
    const parser = new JavascriptParser.default(t.context.sonarwhal); // eslint-disable-line new-cap,no-unused-vars
    const parseObject = {};
    const sourceCodeObject = {};
    const code = 'var x = 8;';
    const script = `<script>  ${code}  </script>`;

    sandbox.spy(t.context.sonarwhal, 'emitAsync');
    sandbox.stub(eslint, 'SourceCode').returns(sourceCodeObject);
    sandbox.stub(espree, 'parse').returns(parseObject);

    sandbox.stub(element, 'outerHTML').resolves(script);
    sandbox.stub(element, 'getAttribute')
        .onFirstCall()
        .returns(null)
        .onSecondCall()
        .returns('text/javascript');

    await t.context.sonarwhal.emitAsync('element::script', { element });

    t.true(t.context.element.getAttribute.calledTwice);
    t.is(t.context.element.getAttribute.args[0][0], 'src');
    t.is(t.context.element.getAttribute.args[1][0], 'type');
    t.true(t.context.espree.parse.calledOnce);
    t.is(t.context.espree.parse.args[0][0], code);
    t.true(t.context.eslint.SourceCode.calledOnce);
    t.is(t.context.eslint.SourceCode.args[0][0], code);
    t.is(t.context.eslint.SourceCode.args[0][1], parseObject);
    t.true(t.context.sonarwhal.emitAsync.calledTwice);

    const args = t.context.sonarwhal.emitAsync.args[1];

    t.is(args[0], 'parser::javascript::end');
    t.is(args[1].resource, 'Internal javascript');
    t.is(args[1].sourceCode, sourceCodeObject);

    sandbox.restore();
});

test.serial('If fetch::end::script is received, then we should parse the code and emit a parser::javascript::end event', async (t) => {
    const sandbox = sinon.sandbox.create();
    const parser = new JavascriptParser.default(t.context.sonarwhal); // eslint-disable-line new-cap,no-unused-vars
    const parseObject = {};
    const sourceCodeObject = {};
    const code = 'var x = 8;';

    sandbox.spy(t.context.sonarwhal, 'emitAsync');
    sandbox.stub(eslint, 'SourceCode').returns(sourceCodeObject);
    sandbox.stub(espree, 'parse').returns(parseObject);

    await t.context.sonarwhal.emitAsync('fetch::end::script', {
        resource: 'script.js',
        response: {
            body: { content: code },
            mediaType: 'text/javascript'
        }
    });

    t.true(t.context.espree.parse.calledOnce);
    t.is(t.context.espree.parse.args[0][0], code);
    t.true(t.context.eslint.SourceCode.calledOnce);
    t.is(t.context.eslint.SourceCode.args[0][0], code);
    t.is(t.context.eslint.SourceCode.args[0][1], parseObject);
    t.true(t.context.sonarwhal.emitAsync.calledTwice);

    const args = t.context.sonarwhal.emitAsync.args[1];

    t.is(args[0], 'parser::javascript::end');
    t.is(args[1].resource, 'script.js');
    t.is(args[1].sourceCode, sourceCodeObject);

    sandbox.restore();
});
