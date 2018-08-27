import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';

import * as HTMLParser from '../src/parser';

test.beforeEach((t) => {
    t.context.engine = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
});

test.serial('If fetch::end::html is received, then we should parse the code and emit a parse::html::end event', async (t) => {
    const sandbox = sinon.createSandbox();
    const parser = new HTMLParser.default(t.context.engine); // eslint-disable-line new-cap,no-unused-vars
    const code = '<!DOCTYPE html><div id="test">Test</div>';

    sandbox.spy(t.context.engine, 'emitAsync');

    await t.context.engine.emitAsync('fetch::end::html', {
        resource: 'test.html',
        response: {
            body: { content: code },
            mediaType: 'text/html',
            url: 'test.html'
        }
    });

    const args = t.context.engine.emitAsync.args;
    const document = args[1][1].document;
    const div = (await document.querySelectorAll('div'))[0];
    const div2 = (await document.querySelectorAll('body > div'))[0];
    const id = div.attributes.filter((attr) => {
        return attr.name === 'id';
    })[0];

    t.is(args[1][0], 'parse::html::end');
    t.is(args[1][1].resource, 'test.html');
    t.is(args[1][1].html, code);
    t.is(await document.pageHTML(), '<!DOCTYPE html><html><head></head><body><div id="test">Test</div></body></html>');
    t.is(await div.outerHTML(), '<div id="test">Test</div>');
    t.is(div.nodeName, 'div');
    t.is(div.getAttribute('id'), 'test');
    t.is(id.value, 'test');
    t.is(div.ownerDocument, document);
    t.true(div.isSame(div2));

    console.log(JSON.stringify(args.map((a) => {
        return a[0];
    })));

    t.is(args[2][0], 'traverse::start');
    t.is(args[3][0], 'element::html');
    t.is(args[4][0], 'traverse::down');
    t.is(args[5][0], 'element::head');
    t.is(args[6][0], 'traverse::down');
    t.is(args[7][0], 'traverse::up');
    t.is(args[8][0], 'element::body');
    t.is(args[9][0], 'traverse::down');
    t.is(args[10][0], 'element::div');
    t.is(args[11][0], 'traverse::down');
    t.is(args[12][0], 'traverse::up');
    t.is(args[13][0], 'traverse::up');
    t.is(args[14][0], 'traverse::up');
    t.is(args[15][0], 'traverse::end');

    sandbox.restore();
});
