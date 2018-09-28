import test from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import { Severity } from '../../src/lib/types';

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

sinon.stub(engine);
sinon.stub(locationHelpers);

proxyquire('../../src/lib/hint-context', { './utils/location-helpers': locationHelpers });

const HintContext = require('../../src/lib/hint-context').HintContext;
const context = new HintContext('test', engine, Severity.error, [null, 'hint-options'], null);

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
            context[method]();
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

test(`hintContext should be a proxy for location-helpers`, (t) => {
    const methods = [
        'findInElement',
        'findProblemLocation'
    ];

    methods.forEach((method) => {
        try {
            context[method]();
        } catch (e) {
            t.fail(`HintContext.${method}() doesn't exist`);
        }
    });

    methods.forEach((method) => {
        try {
            t.true((locationHelpers as any)[method].calledOnce, `HintContext.${method}() didn't call LocationHelpers.${method}()`);
        } catch (e) {
            t.fail(`Error calling HintContext.${method}()`);
        }
    });
});

test('hintContext.hintOptions() should return the second item of the options in the constructor', (t) => {
    const hintOptions = context.hintOptions;

    t.is(hintOptions, 'hint-options', `hintContext.hintOptions() doesn't return the second item of the options`);
});
