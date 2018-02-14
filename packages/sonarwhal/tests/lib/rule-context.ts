import test from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import { Severity } from '../../src/lib/types';

const sonarwhal = {

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
        return Promise.resolve([]);
    },
    report() {
        return Promise.resolve();
    },
    targetedBrowsers() {
        return [];
    }
};

const locationHelpers = {
    findInElement() {
        return Promise.resolve();
    },
    findProblemLocation() {
        return Promise.resolve();
    }
};

sinon.stub(sonarwhal);
sinon.stub(locationHelpers);

proxyquire('../../src/lib/rule-context', { './utils/location-helpers': locationHelpers });

const RuleContext = require('../../src/lib/rule-context').RuleContext;
const context = new RuleContext('test', sonarwhal, Severity.error, [null, 'rule-options'], null);

test(`ruleContext should be a proxy for several sonarwhal's methods`, (t) => {
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
            context[method]();
        } catch (e) {
            t.fail(`RuleContext.${method}() doesn't exist`);
        }
    });

    methods.forEach((method) => {
        try {
            t.true(sonarwhal[method].calledOnce, `RuleContext.${method}() didn't call Sonarwhal.${method}()`);
        } catch (e) {
            t.fail(`Error calling RuleContext.${method}()`);
        }
    });
});

test(`ruleContext should be a proxy for location-helpers`, (t) => {
    const methods = [
        'findInElement',
        'findProblemLocation'
    ];

    methods.forEach((method) => {
        try {
            context[method]();
        } catch (e) {
            t.fail(`RuleContext.${method}() doesn't exist`);
        }
    });

    methods.forEach((method) => {
        try {
            t.true(locationHelpers[method].calledOnce, `RuleContext.${method}() didn't call LocationHelpers.${method}()`);
        } catch (e) {
            t.fail(`Error calling RuleContext.${method}()`);
        }
    });
});

test('ruleContext.ruleOptions() should return the second item of the options in the constructor', (t) => {
    const ruleOptions = context.ruleOptions;

    t.is(ruleOptions, 'rule-options', `ruleContext.ruleOptions() doesn't return the second item of the options`);
});
