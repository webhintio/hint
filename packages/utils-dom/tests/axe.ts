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
    pass: string | string[];
    fail: string | string[];
}

const testAxe = async (t: ExecutionContext, { pass, fail }: TestOptions) => {
    const rule = t.title;
    const passTests = Array.isArray(pass) ? pass : [pass];
    const failTests = Array.isArray(fail) ? fail : [fail];

    for (const p of passTests) {
        const results = await runAxe(p, rule);
        const errors = results.incomplete.filter((v) => {
            return (v as any).error;
        });

        if (results.violations.length || errors.length) {
            t.log(results);
        }
        t.is(results.violations.length, 0, 'All rules should pass');
        t.is(errors.length, 0, 'No rules should be incomplete due to an error');
    }

    for (const f of failTests) {
        const results = await runAxe(f, rule);
        const errors = results.incomplete.filter((v) => {
            return (v as any).error;
        });

        if (!results.violations.length || errors.length) {
            t.log(results);
        }
        t.is(results.violations.length, 1, 'One rule should fail');
        t.is(results.violations[0].id, rule, 'The failed rule id should match the test');
        t.is(errors.length, 0, 'No rules should be incomplete due to an error');
    }
};

test.serial('aria-hidden-focus', async (t) => {
    await testAxe(t, {
        fail: '<p tabindex="0" aria-hidden="true">test</p>',
        pass: '<p aria-hidden="true">test</p>'
    });
});

test.serial('form-field-multiple-labels', async (t) => {
    await testAxe(t, {
        fail: [],
        pass: [
            '<label for="test">One</label><input id="test">',
            '<label for="test">Hi</label><label for="test">Foo</label><input type="text" id="test" />'
        ]
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
        fail: [
            '<label>Name</label><input id="name">',
            '<input type="search"><label for="test">Test</label><input id="test">'
        ],
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
        fail: '<html><li>test</li></html>',
        pass: '<ul><li>test</li></ul>'
    });
});
