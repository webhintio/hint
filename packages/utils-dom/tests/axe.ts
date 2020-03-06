import test, { ExecutionContext } from 'ava';
import * as proxyquire from 'proxyquire';

import { createHTMLDocument } from '../src';
import { populateGlobals } from '../src/globals';

/**
 * Pollute the Node global scope to allow running axe, then run axe
 * against the specified context with the specified rules enabled.
 *
 * Note: Must be used in serial tests to avoid scope collisions.
 */
const runAxe = async (html: string, rule: string) => {
    const doc = createHTMLDocument(html, 'http://localhost');

    populateGlobals(global, doc);
    proxyquire('axe-core', {});

    const axe: typeof import('axe-core') = (global as any).axe;

    const results = await axe.run(document, {
        runOnly: {
            type: 'rule',
            values: [rule]
        }
    });

    delete (global as any).axe;

    return results;
};

type TestOptions = {
    pass: string;
    fail: string;
}

const testAxe = async (t: ExecutionContext, { pass, fail }: TestOptions) => {
    const rule = t.title;
    const passResults = await runAxe(pass, rule);
    const failResults = await runAxe(fail, rule);

    t.log(passResults.violations[0]);
    t.log(failResults);

    t.is(failResults.violations.length, 1);
    t.is(failResults.violations[0].id, rule);
    t.is(passResults.violations.length, 0);
};

test.serial('aria-hidden-focus', async (t) => {
    await testAxe(t, {
        fail: '<p tabindex="0" aria-hidden="true">test</p>',
        pass: '<p aria-hidden="true">test</p>'
    });
});

test.serial('document-title', async (t) => {
    await testAxe(t, {
        fail: '<title></title>',
        pass: '<title>test</title>'
    });
});

test.serial('duplicate-id', async (t) => {
    await testAxe(t, {
        fail: '<div id="foo"></div><div id="foo"></div>',
        pass: '<div id="foo"></div><div id="bar"></div>'
    });
});

test.serial('frame-title', async (t) => {
    await testAxe(t, {
        fail: '<iframe>',
        pass: '<iframe title="test">'
    });
});

test.serial('html-has-lang', async (t) => {
    await testAxe(t, {
        fail: '<html>',
        pass: '<html lang="foo">'
    });
});

test.serial('html-lang-valid', async (t) => {
    await testAxe(t, {
        fail: '<html lang="foo">',
        pass: '<html lang="en">'
    });
});

test.serial('html-xml-lang-mismatch', async (t) => {
    await testAxe(t, {
        fail: '<html lang="en" xml:lang="fr">',
        pass: '<html lang="en" xml:lang="en">'
    });
});

test.serial('image-alt', async (t) => {
    await testAxe(t, {
        fail: '<img src="foo">',
        pass: '<img alt="description" src="foo">'
    });
});

test.serial('label', async (t) => {
    await testAxe(t, {
        fail: '<label>Name</label><input id="name">',
        pass: '<label for="name">Name</label><input id="name">'
    });
});

test.serial('link-name', async (t) => {
    await testAxe(t, {
        fail: '<a href="#"></a>',
        pass: '<a href="#">Read more</a>'
    });
});

test.serial('list', async (t) => {
    await testAxe(t, {
        fail: '<ul>test</ul>',
        pass: '<ul><li>test</li></ul>'
    });
});

test.serial('listitem', async (t) => {
    await testAxe(t, {
        fail: '<li>test</li>',
        pass: '<ul><li>test</li></ul>'
    });
});
