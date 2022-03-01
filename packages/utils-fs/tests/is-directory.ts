import anyTest, { TestFn } from 'ava';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

type Stat = {
    isDirectory: () => boolean;
}

type FS = {
    statSync: () => Stat;
}

type IsDirectoryContext = {
    fs: FS;
    isDirectory: () => boolean;
    sandbox: sinon.SinonSandbox;
}

const test = anyTest as TestFn<IsDirectoryContext>;

const loadScript = (context: IsDirectoryContext): typeof import('../src/is-directory') => {
    return proxyquire('../src/is-directory', { fs: context.fs });
};

test.beforeEach((t) => {
    t.context.sandbox = sinon.createSandbox();

    t.context.isDirectory = () => {
        return false;
    };

    t.context.fs = {
        statSync: () => {
            return { isDirectory: t.context.isDirectory };
        }
    };
});

test.afterEach.always((t) => {
    t.context.sandbox.restore();
});

test('if statSync throws an exception, isDirectory should return false', (t) => {
    t.context.sandbox.stub(t.context.fs, 'statSync').throws();

    const script = loadScript(t.context);

    const result = script.isDirectory('path');

    t.false(result);
});

test('if path is not a directory, it should return false', (t) => {
    t.context.sandbox.stub(t.context, 'isDirectory').returns(false);

    const script = loadScript(t.context);

    const result = script.isDirectory('path');

    t.false(result);
});

test('if path is a directory, it should return true', (t) => {
    t.context.sandbox.stub(t.context, 'isDirectory').returns(true);

    const script = loadScript(t.context);

    const result = script.isDirectory('path');

    t.true(result);
});
