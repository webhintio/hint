import * as path from 'path';

import test from 'ava';

const handlebars = require('../src/handlebars-utils');

test('escapeSafeString transforms the string and calls Handlebars.SafeString', (t) => {
    const source = '`something`';
    const expected = '\\`something\\`';
    const output = handlebars.escapeSafeString(source);

    t.is(output.string, expected, `escapeSafeString doesn't escape correctly`);
});

test('compile template uses the `dependencyVersion` helper', async (t) => {
    const expected = '"dummy-package": "1.0.0"';
    const output = await handlebars.compileTemplate(path.join(__dirname, 'fixtures', 'template.hbs'), {});

    t.is(output.trim(), expected, `${output} !== ${expected}`);
});

test('compile throws an error if template is not found', async (t) => {
    await t.throws(handlebars.compileTemplate(path.join(__dirname, 'idontexist.hbs'), {}));
});
