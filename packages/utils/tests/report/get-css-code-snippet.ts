import * as fs from 'fs';
import * as path from 'path';

import anyTest, { TestInterface } from 'ava';
import * as postcss from 'postcss';

import { getCSSCodeSnippet } from '../../src/report/get-css-code-snippet';

const safe = require('postcss-safe-parser');

const css = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'report.css'), 'utf-8'); // eslint-disable-line no-sync

type Context = {
    ast: postcss.Root;
}

const test = anyTest as TestInterface<Context>;

test.before(async (t) => {
    const parsedCSS = await postcss().process(css, { from: 'report.css', parser: safe });

    t.context.ast = parsedCSS.root!;
});

test(`If node type is 'comment' it should print only the comment.`, (t) => {
    const node = t.context.ast.nodes![0];

    const expected = '/* comment */';

    t.is(getCSSCodeSnippet(node), expected);
});

test(`If node type is 'rule' it should print only the selector.`, (t) => {
    const node = t.context.ast.nodes![1];

    const expected = '.selector { }';

    t.is(getCSSCodeSnippet(node), expected);
});

test(`If node type is 'decl' and the first item in the rule, it should print the rule and only the decl.`, (t) => {
    const ruleNode = t.context.ast.nodes![1] as postcss.Rule;
    const node = ruleNode.nodes![0];
    const expected = `.selector {
    color: #000;
}`;

    t.is(getCSSCodeSnippet(node), expected);
});

test(`If node type is 'decl' and the second item in the rule, it should print the rule and only the decl.`, (t) => {
    const ruleNode = t.context.ast.nodes![1] as postcss.Rule;
    const node = ruleNode.nodes![1];
    const expected = `.selector {
    font-size: 1rem;
}`;

    t.is(getCSSCodeSnippet(node), expected);
});

test(`If node type is 'atrule', it should print the atrule.`, (t) => {
    const node = t.context.ast.nodes![2];
    const expected = `@keyframes keyname { }`;

    t.is(getCSSCodeSnippet(node), expected);
});

test(`If node type is 'rule' and it is inside an atrule, it should print the atrule and the rule.`, (t) => {
    const atRuleNode = t.context.ast.nodes![2] as postcss.AtRule;
    const node = atRuleNode.nodes![0];
    const expected = `@keyframes keyname {
    0% { }
}`;

    t.is(getCSSCodeSnippet(node), expected);
});

test(`If node type is 'comment' and it is inside a rule and an atrule, it should print the atrule, the rule and the comment.`, (t) => {
    const atRuleNode = t.context.ast.nodes![2] as postcss.AtRule;
    const ruleNode = atRuleNode.nodes![0] as postcss.Rule;
    const node = ruleNode.nodes![0];
    const expected = `@keyframes keyname {
    0% {
        /* keyframe comment */
    }
}`;

    t.is(getCSSCodeSnippet(node), expected);
});

test(`If node type is 'decl' and it is inside a rule and an atrule, it should print the atrule, the rule and the decl.`, (t) => {
    const atRuleNode = t.context.ast.nodes![2] as postcss.AtRule;
    const ruleNode = atRuleNode.nodes![0] as postcss.Rule;
    const node = ruleNode.nodes![1];
    const expected = `@keyframes keyname {
    0% {
        width: 0;
    }
}`;

    t.is(getCSSCodeSnippet(node), expected);
});
