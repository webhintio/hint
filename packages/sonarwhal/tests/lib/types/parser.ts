import test from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import { EventEmitter2 } from 'eventemitter2';

import { Sonarwhal } from '../../../src/lib/sonarwhal';

const asPathString = { default() { } };
const asUri = { getAsUri() { } };
const path = {
    dirname() { },
    resolve() { }
};
const loadJSONFileModule = { default() { } };

proxyquire('../../../src/lib/types/parser', {
    '../utils/fs/load-json-file': loadJSONFileModule,
    '../utils/network/as-path-string': asPathString,
    '../utils/network/as-uri': asUri,
    path
});

import { Parser } from '../../../src/lib/types/parser';

class TestParser extends Parser {
    public constructor(sonarwhal: Sonarwhal) {
        super(sonarwhal, 'test');
    }

    public config(config, resource) {
        return this.finalConfig<{ name: string, extends: string }, { error, resource }>(config, resource);
    }
}

test.beforeEach((t) => {
    t.context.sonarwhal = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
});

test(`If config doesn't have an extends property, it should return the same object`, async (t) => {
    const config = { extends: null };

    const testParser = new TestParser(t.context.sonarwhal);

    const result = await testParser.config(config, 'resource');

    t.true(config === result);
});

test.serial('If there is a circular reference, it should throw an exception', async (t) => {
    const sandbox = sinon.createSandbox();

    const config = { extends: 'circularReference' };

    sandbox.stub(asPathString, 'default').returns('circularReference');
    sandbox.stub(path, 'resolve').returns('circularReference');
    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    const testParser = new TestParser(t.context.sonarwhal);

    const result = await testParser.config(config, 'circularReference');

    t.is(result, null);
    t.true(t.context.sonarwhal.emitAsync.calledOnce);
    t.is(t.context.sonarwhal.emitAsync.args[0][1].error.message, 'Circular reference found in file circularReference');


    sandbox.restore();
});

test.serial('If one of the extended files is no a valid JSON, it should throw an exception', async (t) => {
    const sandbox = sinon.createSandbox();

    const config = { extends: 'invalid-extends' };

    sandbox.stub(asPathString, 'default').returns('valid-with-invalid-extends');
    sandbox.stub(path, 'resolve').returns('invalid-extends');
    sandbox.stub(loadJSONFileModule, 'default').throws(new Error('InvalidJSON'));
    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    const testParser = new TestParser(t.context.sonarwhal);

    const result = await testParser.config(config, 'valid-with-invalid-extends');

    t.true(t.context.sonarwhal.emitAsync.calledOnce);
    t.is(result, null);

    sandbox.restore();
});

test.serial('If everything is ok, it should merge all the extended configurations', async (t) => {
    const sandbox = sinon.createSandbox();

    const config = {
        extends: 'valid-extends',
        name: 'valid'
    };

    sandbox.stub(asPathString, 'default').returns('valid-with-extends');
    sandbox.stub(path, 'resolve')
        .onFirstCall()
        .returns('valid-extends')
        .onSecondCall()
        .returns('valid-extends-2');

    const miscStub = sandbox.stub(loadJSONFileModule, 'default')
        .onFirstCall()
        .returns({
            extends: 'valid-extends-2',
            name: 'valid-extends'
        })
        .onSecondCall()
        .returns({
            extends: null,
            name: 'valid-extends-2'
        });

    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    const testParser = new TestParser(t.context.sonarwhal);

    const result = await testParser.config(config, 'valid-with-extends');

    t.true(miscStub.calledTwice);
    t.is(result.name, 'valid');

    sandbox.restore();
});
