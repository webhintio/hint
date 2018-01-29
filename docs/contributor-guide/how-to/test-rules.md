# Test a rule

If you have used the built-in tools to create a new rule (internal or
external), everything should already set up to use `rule-runner.ts`
and the `testRule` method.

If not, you just need to:

1. Create a `tests.ts` file in a folder with the name of the rule
   (e.g.: `src/tests/rules/<rule-id>/tests.ts`)
1. Have the following template:

```ts
import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars
import * as ruleRunner from '../../../helpers/rule-runner';
import { getRuleName } from '../../../../src/lib/utils/rule-helpers';

const ruleName = getRuleName(__dirname);

const tests: Array<RuleTest> = [
    {
        name: 'Name of the tests',
        serverConfig: 'HTML to use',
        reports: [{
            message: 'Message the error will have',
            position: { column: 0, line: 0 } // Where the error will show.
        }]
    },
    { ... }
];

ruleRunner.testRule(ruleName, tests);
```

## testRule()

The signature of `ruleRunner.testRule` is:

* `ruleName`, the name of the rule.
* `tests`, an `Array<RuleTest>`.
* `ruleConfig`, (optional) to modify the defaults of the rule.
* `serial`, (optional, defaults to `false`) to run the tests of that
  rule serially.

`serverConfig` can be of different types depending on particular needs:

* `string` containing the response for `/` (HTML, plain text, etc.).
* `object` with paths as properties names and their content as values:

<!-- eslint-disable no-unused-vars -->

```js
const serverConfig = {
    '/': 'some HTML here',
    'site.webmanifest': 'other content'
};
```

You can even specify the headers and status code for the response for
a specific path, by using the `headers` and `status` properties:

<!-- eslint-disable no-unused-vars -->

```js
const serverConfig = {
    '/': 'page content goes here...',
    '/example.js': {
        content: 'script content goes here...',
        headers: {
            'Content-Type': 'text/javascript; charset=utf-8',
            Header: 'value'
            // ...
        },
        status: statusCode
    }
};
```

Notes:

* If `content` is not specified, it will default to an empty string `''`.
* To remove any of the default HTTP response headers, just set their
  value to `null` (e.g.: `headers: { '<response_header>': null }`).
* `status` defaults to `200`, so it only needs to be specified if its
  value is different.

`rule-runner` will automatically test the rule in all the supported
connectors.

## Throwing an error

If you need to force an error in the `connector` when visiting a URL
you just have to make the content `null`. This will force a redirect
to `test://fail`, thus, causing an exception.

## Testing an external URL

If you need to test an external resource (because you are integrating
with a third party service) you need to use the property `serverUrl`:

```ts
const tests: Array<RuleTest> = [
    {
        name: 'Name of the tests',
        serverUrl: 'https://example.com',
        reports: [{
            message: 'Message the error will have'
        }]
    },
    { ... }
];
```

## Conditional `response`s

Sometimes you need the server to respond differently to a route depending
on the contents of a `request`, e.g.: when requesting an asset that can be
compressed with different formats. The following is an example of how you
can return a different value depending on the content of the
`Accept-Encoding` header:

<!-- eslint-disable no-unused-vars -->

```ts
const serverConfig = {
    '{ "request": { "headers":{ "Accept-Encoding":"gzip" }}}': {
        '/': {
            content: { /* content here */ },
            headers: { /* headers here */ }
        },
        // ...
    },
    '{ "request": { "headers":{ "Accept-Encoding":"br" }}}': {
        '/': {
            content: { /* content here */ },
            headers: { /* headers here */ }
        },
        // ...
    }
}
```

Another alternative way to write the above is the following:

<!-- eslint-disable no-unused-vars -->

```ts
const serverConfig = {
    '/': {
        '{"request":{"headers":{"Accept-Encoding":"gzip"}}}': {
            content: { /* content here */ },
            headers: { /* headers here */ }
        },
        '{"request":{"headers":{"Accept-Encoding":"br"}}}': {
            content: { /* content here */ },
            headers: { /* headers here */ }
        },
        // ...
    },
    ...
}
```

## Execute code `before` or `after` collecting the results

In some scenarios you need to execute some code `before` or `after`
the actual tests (e.g.: if you need to mock a dependency). For those
cases you can use the `before` and `after` properties of `RuleTest`:

```ts
const tests: Array<RuleTest> = [
    {
        after() {
            // Code to execute right before calling `connector.close` goes here.
        }
        before() {
            // Code to execute before the creation of the sonarwhal object goes here.
        },
        name: 'Name of the tests',
        serverUrl: 'https://example.com',
        reports: [{
            message: 'Message the error will have'
        }]
    },
    { ... }
];
```
