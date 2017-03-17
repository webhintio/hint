import * as jsdom from 'jsdom';
import * as path from 'path';
import * as pify from 'pify';
import * as sinon from 'sinon';
import test from 'ava';

import { readFile } from '../../../../lib/util/misc';
import { findProblemLocation } from '../../../../lib/util/location-helpers';
import * as rule from '../../../../lib/rules/lang-attribute/lang-attribute';

import { Rule, RuleBuilder, ElementFoundEvent } from '../../../../lib/types'; // eslint-disable-line no-unused-vars

const getDOM = async (filePath) => {
    return await pify(jsdom.env)(readFile(filePath));
};

const runRule = async (t, filePath: string, tests): Promise<void> => {
    const context = {
        findProblemLocation: (element, content) => {
            return findProblemLocation(element, {column: 0, line: 0}, content);
        },
        report: sinon.spy()
    };

    const window = await getDOM(path.join(__dirname, 'fixtures', filePath));
    const instance = (<Rule>rule).create(context);
    const eventData = { element: window.document.documentElement };

    instance['element::html'](eventData);

    tests(t, context, eventData);
};

test(`'lang' attribute is not specified`, runRule, 'no-lang-attribute.html', (t, context, eventData) => {
    t.is(context.report.calledOnce, true);
    t.is(context.report.calledWithExactly(
        eventData.resource,
        eventData.element,
        `'lang' attribute not specified on the 'html' element`
    ), true);
});

test(`'lang' attribute is specified with no value`, runRule, 'lang-attribute-with-no-value.html', (t, context, eventData) => {
    t.is(context.report.calledOnce, true);
    t.is(context.report.calledWithExactly(
        eventData.resource,
        eventData.element,
        `empty 'lang' attribute specified on the 'html' element`,
        {column: 7, line: 1}
    ), true);
});

test(`'lang' attribute is specified and its value is an empty string`, runRule, 'lang-attribute-with-value-of-empty-string.html', (t, context, eventData) => {
    t.is(context.report.calledOnce, true);
    t.is(context.report.calledWithExactly(
        eventData.resource,
        eventData.element,
        `empty 'lang' attribute specified on the 'html' element`,
        {column: 7, line: 1}
    ), true);
});

test(`'lang' attribute is specified and its value is not an empty string`, runRule, 'lang-attribute-with-valid-value.html', (t, context) => {
    t.is(context.report.notCalled, true);
});
