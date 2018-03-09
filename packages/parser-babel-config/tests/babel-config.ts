import * as sinon from 'sinon';
import test from 'ava';
import { EventEmitter2 } from 'eventemitter2';

import BabelConfigParser from '../src/babel-config';

test.beforeEach((t) => {
    t.context.sonarwhal = new EventEmitter2({
        delimiter: '::',
        maxListeners: 0,
        wildcard: true
    });
});

test.serial('If any file is parsed, it should emit a `notfound::babel-config` error', async (t) => {
    const sandbox = sinon.sandbox.create();

    new BabelConfigParser(t.context.sonarwhal); // eslint-disable-line no-new
    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    await t.context.sonarwhal.emitAsync('scan::end', {});

    t.true(t.context.sonarwhal.emitAsync.calledTwice);
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'notfound::babel-config');
});

test.serial(`If the resource doesn't match the regex, nothing should happen`, async (t) => {
    const sandbox = sinon.sandbox.create();

    new BabelConfigParser(t.context.sonarwhal); // eslint-disable-line no-new
    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    await t.context.sonarwhal.emitAsync('fetch::end::json', { resource: '.babelrcconfig' });

    t.true(t.context.sonarwhal.emitAsync.calledOnce);
});

test.serial('If the file contains an invalid json, it should fail', async (t) => {
    const sandbox = sinon.sandbox.create();

    new BabelConfigParser(t.context.sonarwhal); // eslint-disable-line no-new
    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    await t.context.sonarwhal.emitAsync('fetch::end::json', {
        resource: 'babelrc.json',
        response: { body: { content: '{"invalidJson}' } }
    });

    t.true(t.context.sonarwhal.emitAsync.calledTwice);
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'invalid-json::babel-config');
});

test.serial('If the file contains an invalid schema, it should fail', async (t) => {
    const sandbox = sinon.sandbox.create();

    new BabelConfigParser(t.context.sonarwhal); // eslint-disable-line no-new
    const invalidSchemaContent = `{
        "plugins": ["transform-react-jsx"],
        "moduleId": 1,
        "ignore": [
          "foo.js",
          "bar/**/*.js"
        ]
      }`;

    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    await t.context.sonarwhal.emitAsync('fetch::end::json', {
        resource: 'babelrc.json',
        response: { body: { content: invalidSchemaContent } }
    });

    t.is(t.context.sonarwhal.emitAsync.callCount, 3);
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'invalid-schema::babel-config');
    t.is(t.context.sonarwhal.emitAsync.args[2][0], 'parse::babel-config');
});

test.serial('If the content type is unknown, it should still validate if the file name is a match', async (t) => {
    const sandbox = sinon.sandbox.create();

    new BabelConfigParser(t.context.sonarwhal); // eslint-disable-line no-new
    const invalidSchemaContent = `{
        "plugins": ["transform-react-jsx"],
        "moduleId": 1,
        "ignore": [
          "foo.js",
          "bar/**/*.js"
        ]
      }`;

    sandbox.spy(t.context.sonarwhal, 'emitAsync');

    await t.context.sonarwhal.emitAsync('fetch::end::unknown', {
        resource: '.babelrc',
        response: { body: { content: invalidSchemaContent } }
    });

    t.is(t.context.sonarwhal.emitAsync.callCount, 3);
    t.is(t.context.sonarwhal.emitAsync.args[1][0], 'invalid-schema::babel-config');
    t.is(t.context.sonarwhal.emitAsync.args[2][0], 'parse::babel-config');
});
