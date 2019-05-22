import test from 'ava';

import { generateHTMLPage } from '../../src/test';

test('generateHTML generates a starter HTML', (t) => {
    const page = generateHTMLPage(undefined, `<p>hi!</p>`);
    const expected = `<!doctype html>
<html lang="en">
    <head>
        <title>test</title>
    </head>
    <body>
        <p>hi!</p>
    </body>
</html>`;

    t.is(page, expected);
});
