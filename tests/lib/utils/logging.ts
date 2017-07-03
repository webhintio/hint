import test from 'ava';
import * as sinon from 'sinon';

import { loggerInitiator } from '../../../src/lib/utils/logging';

const logger = loggerInitiator(__filename, false);

test.beforeEach((t) => {
    t.context.console = console;
    console.log = sinon.spy(console, 'log');
    console.error = sinon.spy(console, 'error');
});

test.afterEach.always((t) => {
    t.context.console.log.restore();
    t.context.console.error.restore();
});

test.serial('logging calls console.log', (t) => {
    logger.log('Log');
    t.true(t.context.console.log.calledOnce);
    t.true(t.context.console.error.notCalled);
});

test.serial('logging calls console.log', (t) => {
    logger.error('Error');
    t.true(t.context.console.log.notCalled);
    t.true(t.context.console.error.calledOnce);
});
