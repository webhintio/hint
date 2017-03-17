import test from 'ava';
import * as sinon from 'sinon';

import * as logging from '../../../lib/util/logging';

test.beforeEach((t) => {
    t.context.console = console;
    console.log = sinon.spy(console, 'log');
    console.error = sinon.spy(console, 'error');
});

test.afterEach((t) => {
    t.context.console.log.restore();
    t.context.console.error.restore();
});

test.serial('logging calls console.log', (t) => {
    logging.log('Log');
    t.true(t.context.console.log.calledOnce);
    t.true(t.context.console.error.notCalled);
});

test.serial('logging calls console.log', (t) => {
    logging.error('Error');
    t.true(t.context.console.log.notCalled);
    t.true(t.context.console.error.calledOnce);
});
