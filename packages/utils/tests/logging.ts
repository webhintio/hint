import anyTest, { TestInterface } from 'ava';
import * as sinon from 'sinon';

import { logger } from '../src';

type LoggingContext = {
    consoleLogSpy: sinon.SinonSpy<[any?, ...any[]], void>;
    consoleErrorSpy: sinon.SinonSpy<[any?, ...any[]], void>;
    consoleWarnSpy: sinon.SinonSpy<[any?, ...any[]], void>;
};

const test = anyTest as TestInterface<LoggingContext>;

test.beforeEach((t) => {
    t.context.consoleLogSpy = sinon.spy(console, 'log');
    t.context.consoleErrorSpy = sinon.spy(console, 'error');
    t.context.consoleWarnSpy = sinon.spy(console, 'warn');
});

test.afterEach.always((t) => {
    t.context.consoleLogSpy.restore();
    t.context.consoleErrorSpy.restore();
    t.context.consoleWarnSpy.restore();
});

test.serial('logging calls console.log', (t) => {
    logger.log('Log');
    t.true(t.context.consoleLogSpy.calledOnce);
    t.true(t.context.consoleErrorSpy.notCalled);
    t.true(t.context.consoleWarnSpy.notCalled);
});

test.serial('logging calls console.error', (t) => {
    logger.error('Error');
    t.true(t.context.consoleLogSpy.notCalled);
    t.true(t.context.consoleErrorSpy.calledOnce);
    t.true(t.context.consoleWarnSpy.notCalled);
});

test.serial('logging calls console.warn', (t) => {
    logger.warn('Warn');
    t.true(t.context.consoleLogSpy.notCalled);
    t.true(t.context.consoleErrorSpy.notCalled);
    t.true(t.context.consoleWarnSpy.calledOnce);
});
