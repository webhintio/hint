import * as jsdom from 'jsdom';
import * as path from 'path';
import * as pify from 'pify';
import * as sinon from 'sinon';

import { test, ContextualTestContext } from 'ava'; // eslint-disable-line no-unused-vars
import { Rule, RuleBuilder, ElementFoundEvent, NetworkData } from '../../lib/types'; // eslint-disable-line no-unused-vars
import { RuleTest } from './rule-test-type'; // eslint-disable-line no-unused-vars

import { readFile } from '../../lib/util/misc';
import { findProblemLocation } from '../../lib/util/location-helpers';


let ruleBuilder;

const getDOM = async (filePath) => {
    return await pify(jsdom.env)(readFile(filePath));
};

test.beforeEach((t) => {
    const ruleContext = {
        async fetchContent() {
            throw new Error('Request failed');
        },
        findProblemLocation: (element, content) => {
            return findProblemLocation(element, { column: 0, line: 0 }, content);
        },
        report: sinon.spy()
    };

    t.context.rule = ruleBuilder.create(ruleContext);
    t.context.ruleContext = ruleContext;
});

test.afterEach((t) => {
    t.context.ruleContext.report.reset();
});

/** Creates an event for HTML fixtures (`element::` events) */
const getHTMLFixtureEvent = async (event): Promise<null | ElementFoundEvent> => {
    if (path.extname(event.fixture) !== '.html' || event.name.indexOf('element::') !== 0) {
        return Promise.resolve(null);
    }

    const window = await getDOM(event.fixture);

    const eventNameParts = event.name.split('::');

    const elementType = eventNameParts[1];
    const elements = window.document.querySelectorAll(elementType);
    const elementIndex = eventNameParts.length === 3 ? parseInt(eventNameParts[2]) : 0;
    const eventData = <ElementFoundEvent>{
        element: elements[elementIndex],
        resource: event.fixture
    };

    return Promise.resolve(eventData);
};

/** Contains all the possible ways of getting a fixture */
const fixtureGetters = [getHTMLFixtureEvent];

/** Returns an event of the specific type for a given fixture */
const getFixtureEvent = async (event): Promise<Object> => {
    const getters = fixtureGetters.slice();
    let fixtureEvent = null;

    while (getters.length && !fixtureEvent) {
        fixtureEvent = await getters.shift()(event);
    }

    return fixtureEvent;
};

/** Runs a test for the rule being tested */
const runRule = async (t: ContextualTestContext, ruleTest: RuleTest) => {
    const ruleContext = t.context.ruleContext;
    const { events, report } = ruleTest;

    for (const event of events) {
        const eventData = await getFixtureEvent(event);
        const eventName = event.name.split('::')
            .slice(0, 2)
            .join('::');

        if (event.networkData) {
            ruleContext.fetchContent = sinon.stub();

            event.networkData.forEach((data, i) => { // eslint-disable-line no-loop-func
                ruleContext.fetchContent.onCall(i).returns(Promise.resolve(data));
            });
        }

        await t.context.rule[eventName](eventData);
    }

    if (!report) {
        t.true(ruleContext.report.notCalled);

        return;
    } else if (ruleContext.report.notCalled) {
        t.fail(`report method should have been called`);

        return;
    }

    const reportArguments = ruleContext.report.firstCall.args;

    t.is(reportArguments[2], report.message);
    t.deepEqual(reportArguments[3], report.position);

    return;
};

/** Runs all the tests for a given rule */
export const testRule = (rule: Rule, ruleTests: Array<RuleTest>) => {
    ruleBuilder = rule;

    ruleTests.forEach((ruleTest) => {
        test(ruleTest.name, runRule, ruleTest);
    });
};
