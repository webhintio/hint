import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { FetchEnd } from 'hint/dist/src/lib/types';
import { Engine } from 'hint';

import * as HTMLParser from '../src/parser';
import { HTMLEvents, HTMLParse } from '../src/parser';

test('If `fetch::end::html` is received, then the code should be parsed and the `parse::end::html` event emitted', async (t) => {
    const sandbox = sinon.createSandbox();
    const engine: Engine<HTMLEvents> = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    }) as Engine<HTMLEvents>;
    const code = '<!DOCTYPE html><div id="test">Test</div>';
    new HTMLParser.default(engine); // eslint-disable-line

    const engineEmitAsyncSpy = sandbox.spy(engine, 'emitAsync');

    await engine.emitAsync('fetch::end::html', {
        resource: 'test.html',
        response: {
            body: { content: code },
            mediaType: 'text/html',
            url: 'test.html'
        }
    } as FetchEnd);

    const args = engineEmitAsyncSpy.args;
    const document = (args[2][1] as HTMLParse).document;
    const div = document.querySelectorAll('div')[0];
    const div2 = document.querySelectorAll('body > div')[0];
    const location = div.getLocation();

    let id = null;

    for (let i = 0; i < div.attributes.length; i++) {
        if (div.attributes[i].name === 'id') {
            id = div.attributes[i];
            break;
        }
    }

    t.is(args[1][0], 'parse::start::html');
    t.is(args[2][0], 'parse::end::html');
    t.is((args[2][1] as HTMLParse).resource, 'test.html');
    t.is((args[2][1] as HTMLParse).html, code);
    t.is(document.pageHTML(), '<!DOCTYPE html><html><head></head><body><div id="test">Test</div></body></html>');
    t.is(div.outerHTML, '<div id="test">Test</div>');
    t.is(div.nodeName.toLowerCase(), 'div');
    t.is(div.getAttribute('id'), 'test');
    t.is(location && location.line, 0);
    t.is(location && location.column, 16);
    t.is(id && id.value, 'test');
    t.true(div.isSame(div2));

    sandbox.restore();
});
