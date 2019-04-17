import * as fs from 'fs';
import * as path from 'path';

import test from 'ava';

import { createHTMLDocument } from '../../src/dom';
import { getHTMLCodeSnippet } from '../../src/report/get-html-code-snippet';

const html = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'html-report.html'), 'utf-8'); // eslint-disable-line no-sync

const htmlDocument = createHTMLDocument(html);

test('If opening tag is bigger than threshold, nothing happend', (t) => {
    const element = htmlDocument.querySelectorAll('meta')[0];

    t.is(getHTMLCodeSnippet(element), element.outerHTML);
});

test('If element is to big, return just the opening tag', (t) => {
    const element = htmlDocument.querySelectorAll('.container')[0];

    t.is(getHTMLCodeSnippet(element), '<div class="container">');
});

test('If element is big, but the threshold too, it will return the outerHTML', (t) => {
    const element = htmlDocument.querySelectorAll('.container')[0];
    const outerHTML = element.outerHTML;

    t.is(getHTMLCodeSnippet(element, outerHTML.length), outerHTML);
});
