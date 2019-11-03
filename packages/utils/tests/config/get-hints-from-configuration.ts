import * as path from 'path';

import testAny, { TestInterface } from 'ava';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';

import { ResourceType } from '../../src/types/resource-type';
import { loadJSONFile } from '../../src/fs';

const configurationWithoutHints = loadJSONFile(path.join(__dirname, 'fixtures', 'configurationWithoutHints.json'));
const configurationWithHints = loadJSONFile(path.join(__dirname, 'fixtures', 'configurationWithHints.json'));
const configurationWithHints2 = loadJSONFile(path.join(__dirname, 'fixtures', 'configurationWithHints2.json'));
const configurationWithExtends = loadJSONFile(path.join(__dirname, 'fixtures', 'configurationWithExtends.json'));
const configurationWithTwoExtends = loadJSONFile(path.join(__dirname, 'fixtures', 'configurationWithTwoExtends.json'));
const configurationWithLoop1 = loadJSONFile(path.join(__dirname, 'fixtures', 'configurationWithLoop1.json'));
const configurationWithLoop2 = loadJSONFile(path.join(__dirname, 'fixtures', 'configurationWithLoop2.json'));

type GetHintsContext = {
    sandbox: sinon.SinonSandbox;
    loadResource: (name: string, type: ResourceType, configurations: string[]) => any;
}

const test = testAny as TestInterface<GetHintsContext>;

const loadScript = (context: GetHintsContext) => {
    return proxyquire('../../src/config/get-hints-from-configuration', { '../packages/load-resource': { loadResource: context.loadResource } })
        .getHintsFromConfiguration;
};

test.beforeEach((t) => {
    t.context.sandbox = sinon.createSandbox();
    t.context.loadResource = (name: string, type: ResourceType, configurations: string[]) => { };
});

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('Neither hints nor extends should return an empty object.', (t) => {
    const getHintsFromConfiguration = loadScript(t.context);

    const hints = getHintsFromConfiguration({});

    t.deepEqual(hints, {});
});

test('If extends is not defined, it should return the hints normalized.', (t) => {
    const getHintsFromConfiguration = loadScript(t.context);

    const hints = getHintsFromConfiguration({ hints: ['hint1', 'hint2', 'hint3:warning'] });

    t.is(hints.hint1, 'default');
    t.is(hints.hint2, 'default');
    t.is(hints.hint3, 'warning');
});

test(`If extends is defined, but it doesn't have any hint, should return only the hints in the config.`, (t) => {
    const loadResourceStub = t.context.sandbox.stub(t.context, 'loadResource').returns(configurationWithoutHints);

    const getHintsFromConfiguration = loadScript(t.context);
    const hints = getHintsFromConfiguration({
        extends: ['configurationWithoutHints'],
        hints: ['hint1', 'hint2', 'hint3:warning']
    });

    t.is(hints.hint1, 'default');
    t.is(hints.hint2, 'default');
    t.is(hints.hint3, 'warning');
    t.true(loadResourceStub.calledOnce);
});

test('If extends is defined, should return all the hints merged.', (t) => {
    const loadResourceStub = t.context.sandbox.stub(t.context, 'loadResource').returns(configurationWithHints);

    const getHintsFromConfiguration = loadScript(t.context);
    const hints = getHintsFromConfiguration({
        extends: ['configurationWithHints'],
        hints: {
            hint1: ['error'],
            hint2: 'off',
            hint4: 'warning'
        }
    });

    t.is(hints.hint1[0], 'error');
    t.is(hints.hint2, 'off');
    t.is(hints.hint3[0], 'warning');
    t.is(hints.hint4, 'warning');
    t.true(loadResourceStub.calledOnce);
});

test('If extended configuration has another extends, should return all the hints merged with the right value', (t) => {
    const loadResourceStub = t.context.sandbox.stub(t.context, 'loadResource');

    loadResourceStub
        .withArgs('configurationWithExtends', ResourceType.configuration, [])
        .returns(configurationWithExtends)
        .withArgs('configurationWithHints', ResourceType.configuration, ['configurationWithExtends'])
        .returns(configurationWithHints);

    const getHintsFromConfiguration = loadScript(t.context);
    const hints = getHintsFromConfiguration({
        extends: ['configurationWithExtends'],
        hints: {
            hint2: 'off',
            hint5: 'warning'
        }
    });

    t.is(hints.hint1, 'warning');
    t.is(hints.hint2, 'off');
    t.is(hints.hint3[0], 'warning');
    t.is(hints.hint4[0], 'error');
    t.is(hints.hint5, 'warning');
    t.true(loadResourceStub.calledTwice);
});

test('If extends has a loop, it should return the hints until loop was detected', (t) => {
    const loadResourceStub = t.context.sandbox.stub(t.context, 'loadResource');

    loadResourceStub
        .withArgs('configurationWithLoop1', ResourceType.configuration, sinon.match((value) => {
            return Array.isArray(value);
        }))
        .returns(configurationWithLoop1)
        .withArgs('configurationWithLoop2', ResourceType.configuration, sinon.match((value) => {
            return Array.isArray(value);
        }))
        .returns(configurationWithLoop2);

    const getHintsFromConfiguration = loadScript(t.context);
    const hints = getHintsFromConfiguration({
        extends: ['configurationWithLoop1'],
        hints: {
            hint2: 'off',
            hint4: 'error'
        }
    });

    t.is(hints.hint1, 'warning');
    t.is(hints.hint2, 'off');
    t.is(hints.hint3, 'warning');
    t.is(hints.hint4, 'error');
    t.true(loadResourceStub.calledTwice);
});

test('If extended configuration has more than one extends, should return all the hints merged with the right value', (t) => {
    const loadResourceStub = t.context.sandbox.stub(t.context, 'loadResource');

    loadResourceStub
        .withArgs('configurationWithTwoExtends', ResourceType.configuration, [])
        .returns(configurationWithTwoExtends)
        .withArgs('configurationWithHints', ResourceType.configuration, ['configurationWithTwoExtends'])
        .returns(configurationWithHints)
        .withArgs('configurationWithHints2', ResourceType.configuration, ['configurationWithTwoExtends'])
        .returns(configurationWithHints2);

    const getHintsFromConfiguration = loadScript(t.context);
    const hints = getHintsFromConfiguration({
        extends: ['configurationWithTwoExtends'],
        hints: {
            hint2: 'off',
            hint5: 'warning'
        }
    });

    t.is(hints.hint1, 'warning');
    t.is(hints.hint2, 'off');
    t.is(hints.hint3, 'error');
    t.is(hints.hint4[0], 'error');
    t.is(hints.hint5, 'warning');
    t.true(loadResourceStub.calledThrice);
});
