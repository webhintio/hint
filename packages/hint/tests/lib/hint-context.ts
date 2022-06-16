import test from 'ava';
import * as sinon from 'sinon';

import { HintContext } from '../../src/lib/hint-context';
import { Problem, Severity } from '@hint/utils-types';
import { Engine, HintMetadata } from '../../src/lib';
import { createHTMLDocument } from '@hint/utils-dom';

const engine = {

    evaluate() {
        return Promise.resolve(true);
    },
    fetchContent() {
        return Promise.resolve();
    },
    pageContent() {
        return null;
    },
    pageDOM() {
        return null;
    },
    pageHeaders() {
        return null;
    },
    querySelectorAll() {
        return [];
    },
    report() {
        return;
    },
    targetedBrowsers() {
        return [];
    }
} as unknown as Engine;

sinon.stub(engine);

const context = new HintContext('test', engine, Severity.error, [null, 'hint-options'], null as unknown as HintMetadata, []);

test(`hintContext should be a proxy for several engine's methods`, (t) => {
    const methods = [
        'evaluate',
        'fetchContent',
        'pageContent',
        'pageDOM',
        'pageHeaders',
        'querySelectorAll',
        'report',
        'targetedBrowsers'
    ];

    methods.forEach((method) => {
        try {
            (context as any)[method]('', '', {});
        } catch (e) {
            t.fail(`HintContext.${method}() doesn't exist`);
        }
    });

    methods.forEach((method) => {
        try {
            t.true((engine as any)[method].calledOnce, `HintContext.${method}() didn't call Engine.${method}()`);
        } catch (e) {
            t.fail(`Error calling HintContext.${method}()`);
        }
    });
});

test('hintContext.hintOptions() should return the second item of the options in the constructor', (t) => {
    const hintOptions = context.hintOptions;

    t.is(hintOptions, 'hint-options', `hintContext.hintOptions() doesn't return the second item of the options`);
});

test('hintContext.engineKey() should map to the underlying engine', (t) => {
    t.is(context.engineKey, engine);
});

test('hintContext.report() should extract location from elements', (t) => {
    let problem: Problem | undefined;
    const engine = {
        report(p: Problem) {
            problem = p;
        }
    } as Partial<Engine> as Engine;
    const context = new HintContext('elm-loc', engine, Severity.default, null, null as unknown as HintMetadata, []);
    const element = createHTMLDocument('<div id="test">Test</div>', 'http://localhost').body.children[0];

    context.report('http://localhost', 'Test Location', { element, severity: Severity.error });

    t.is(problem?.location?.line, 0, 'Start line');
    t.is(problem?.location?.column, 1, 'Start column');
});

test('hintContext.report() should extract location from attributes', (t) => {
    let problem: Problem | undefined;
    const engine = {
        report(p: Problem) {
            problem = p;
        }
    } as Partial<Engine> as Engine;
    const context = new HintContext('attr-loc', engine, Severity.default, null, null as unknown as HintMetadata, []);
    const element = createHTMLDocument('<div id="test">Test</div>', 'http://localhost').body.children[0];

    context.report('http://localhost', 'Test Location', { attribute: 'id', element, severity: Severity.error });

    t.is(problem?.location?.line, 0, 'Start line');
    t.is(problem?.location?.column, 5, 'Start column');
});

test('hintContext.report() rejects attributes without an element', (t) => {
    const engine = {} as Partial<Engine> as Engine;
    const context = new HintContext('attr-no-elm', engine, Severity.default, null, null as unknown as HintMetadata, []);

    t.throws(() => {
        context.report('http://localhost', 'Test Location', { attribute: 'id', severity: Severity.error });
    }, { message: 'The `element` option must be specified when `attribute` is provided.' });
});
