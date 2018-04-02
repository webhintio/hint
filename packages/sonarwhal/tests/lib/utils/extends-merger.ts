import test from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

const getAsPathStringUtil = { getAsPathString() { } };
const getAsUriUtil = { getAsUri() { } };
const path = {
    dirname() { },
    resolve() { }
};
const misc = { loadJSONFile() { } };

proxyquire('../../../src/lib/utils/extends-merger', {
    './get-as-path-string': getAsPathStringUtil,
    './get-as-uri': getAsUriUtil,
    './misc': misc,
    path
});

import { finalConfig, ErrorCodes } from '../../../src/lib/utils/extends-merger';

test(`If config doesn't have an extends property, it should return the same object`, (t) => {
    const config = { extends: null };

    const result = finalConfig(config, 'resource');

    t.true(config === result);
});

test('If there is a circular reference, it should throw an exception', (t) => {
    const sandbox = sinon.createSandbox();

    const config = { extends: 'circularReference' };

    sandbox.stub(getAsPathStringUtil, 'getAsPathString').returns('circularReference');
    sandbox.stub(path, 'resolve').returns('circularReference');

    t.plan(1);
    try {
        finalConfig(config, 'circularReference');
    } catch (err) {
        t.is(err.code, ErrorCodes.circular);
    }

    sandbox.restore();
});

test('If one of the extended files is no a valid JSON, it should throw an exception', (t) => {
    const sandbox = sinon.createSandbox();

    const config = { extends: 'invalid-extends' };

    sandbox.stub(getAsPathStringUtil, 'getAsPathString').returns('valid-with-invalid-extends');
    sandbox.stub(path, 'resolve').returns('invalid-extends');
    sandbox.stub(misc, 'loadJSONFile').throws(new Error('InvalidJSON'));

    t.plan(1);
    try {
        finalConfig(config, 'valid-with-invalid-extends');
    } catch (err) {
        t.not(err.code, ErrorCodes.circular);
    }

    sandbox.restore();
});

test('If everything is ok, it should merge all the extended configurations', (t) => {
    const sandbox = sinon.createSandbox();

    const config = {
        extends: 'valid-extends',
        name: 'valid'
    };

    sandbox.stub(getAsPathStringUtil, 'getAsPathString').returns('valid-with-extends');
    sandbox.stub(path, 'resolve')
        .onFirstCall()
        .returns('valid-extends')
        .onSecondCall()
        .returns('valid-extends-2');

    const miscStub = sandbox.stub(misc, 'loadJSONFile')
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

    const result = finalConfig(config, 'valid-with-extends');

    t.true(miscStub.calledTwice);
    t.is(result.name, 'valid');

    sandbox.restore();
});
