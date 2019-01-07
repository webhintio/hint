import test from 'ava';
import * as sinon from 'sinon';

import * as logging from '../../../src/lib/utils/logging';

test.beforeEach((t) => {
    t.context.console = console;
    console.log = sinon.spy(console, 'log');
    console.error = sinon.spy(console, 'error');
    console.warn = sinon.spy(console, 'warn');
});

test.afterEach.always((t) => {
    t.context.console.log.restore();
    t.context.console.error.restore();
    t.context.console.warn.restore();
});

test.serial('logging calls console.log', (t) => {
    logging.log('Log');
    t.true(t.context.console.log.calledOnce);
    t.true(t.context.console.error.notCalled);
    t.true(t.context.console.warn.notCalled);
});

test.serial('logging calls console.error', (t) => {
    logging.error('Error');
    t.true(t.context.console.log.notCalled);
    t.true(t.context.console.error.calledOnce);
    t.true(t.context.console.warn.notCalled);
});

test.serial('logging calls console.warn', (t) => {
    logging.warn('Warn');
    t.true(t.context.console.log.notCalled);
    t.true(t.context.console.error.notCalled);
    t.true(t.context.console.warn.calledOnce);
});
