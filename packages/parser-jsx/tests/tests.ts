import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';
import { Engine, FetchEnd } from 'hint';
import { HTMLEvents, HTMLParse } from '@hint/parser-html';
import JavaScriptParser, { ScriptEvents } from '@hint/parser-javascript';

import JSXParser from '../src/parser';

const emitFetchEndJSX = async (engine: Engine<ScriptEvents & HTMLEvents>, content: string) => {
    let event = {} as HTMLParse;

    engine.on('parse::end::html', (e) => {
        event = e;
    });

    await engine.emitAsync('fetch::end::unknown', {
        resource: 'https://webhint.io/test.jsx',
        response: {
            body: { content },
            mediaType: 'text/jsx'
        }
    } as FetchEnd);

    return event;
};

const mockEngine = () => {
    return new EventEmitter2({
        delimiter: '::',
        wildcard: true
    }) as Engine<ScriptEvents & HTMLEvents>;
};

const mockContext = () => {
    const engine = mockEngine();
    const jsParser = new JavaScriptParser(engine);
    const jsxParser = new JSXParser(engine);

    return { engine, jsParser, jsxParser };
};

const parseJSX = (content: string) => {
    const { engine } = mockContext();

    return emitFetchEndJSX(engine, content);
};

test('It translates basic JSX to HTML', async (t) => {
    let receivedStart = false;
    const { engine } = mockContext();

    engine.on('parse::start::html', (e) => {
        receivedStart = true;
    });

    const { html } = await emitFetchEndJSX(engine, `const jsx = <div>Test</div>;`);

    t.true(receivedStart);
    t.is(html, `<!doctype html>\n<html data-webhint-fragment=""><head></head><body><div>Test</div></body></html>`);
});

test('It does not emit HTML events if no JSX is present', async (t) => {
    let received = false;
    const { engine } = mockContext();

    engine.on('parse::start::html', () => {
        received = true;
    });

    engine.on('parse::end::html', () => {
        received = true;
    });

    await emitFetchEndJSX(engine, `const x = 4;`);

    t.false(received);
});

test('It marks the resulting HTML as a fragment', async (t) => {
    const { document } = await parseJSX(`const jsx = <div>Test</div>;`);

    t.true(document.isFragment);
});

test('It omits non-HTML components (but keeps children)', async (t) => {
    const { document } = await parseJSX(`const jsx = <div><button>1</button><Button>2</Button></div>;`);
    const body = document.querySelectorAll('body')[0];

    t.is(body.innerHTML, `<div><button>1</button>2</div>`);
});

test('It serializes attributes', async (t) => {
    const { document } = await parseJSX(`const jsx = <button type="button">Test</button>;`);
    const button = document.querySelectorAll('button')[0];

    t.is(button.outerHTML, '<button type="button">Test</button>');
});

test('It ignores spread attributes', async (t) => {
    const { document } = await parseJSX(`const jsx = <button type="button" {...foo}>Test</button>;`);
    const button = document.querySelectorAll('button')[0];

    t.is(button.outerHTML, '<button type="button">Test</button>');
});

test('It handles boolean attributes', async (t) => {
    const { document } = await parseJSX(`const jsx = <div hidden>Test</div>;`);
    const div = document.querySelectorAll('div')[0];

    t.is(div.outerHTML, '<div hidden="">Test</div>');
});

test('It omits JSX fragments but keeps their children', async (t) => {
    const { document } = await parseJSX(`const jsx = <><div>1</div><div>2</div></>;`);
    const body = document.querySelectorAll('body')[0];

    t.is(body.innerHTML, '<div>1</div><div>2</div>');
});

test('It treats separate JSX islands as siblings', async (t) => {
    const { document } = await parseJSX(`
        const jsx1 = () => {
            return <div>1</div>;
        };
        const c = a + b;
        const jsx2 = <div>2</div>;
    `);
    const body = document.querySelectorAll('body')[0];

    t.is(body.innerHTML, `<div>1</div><div>2</div>`);
});

test('It marks which attributes resulted from template expressions', async (t) => {
    const { document } = await parseJSX(`const jsx = <button type="button" id={myId}>Test</button>;`);
    const button = document.querySelectorAll('button')[0];

    t.is(button.getAttribute('type'), 'button');
    t.is(button.getAttribute('id'), '{expression}');
    t.false(button.isAttributeAnExpression('type'));
    t.true(button.isAttributeAnExpression('id'));
});

test('It replaces expressions with text placeholders', async (t) => {
    const { document } = await parseJSX(`const jsx = <div>{myText}</div>;`);
    const div = document.querySelectorAll('div')[0];

    t.is(div.innerHTML, '{expression}');
});

test('It translates source locations correctly', async (t) => {
    const { document } = await parseJSX(`const a = 4;\nconst jsx = <div>{myText}</div>;`);
    const div = document.querySelectorAll('div')[0];
    const { column, line } = div.getLocation();

    t.is(column, 13);
    t.is(line, 1);
});
