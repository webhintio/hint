# How to test rules

Testing a new rule is really easy if you use `rule-runner.ts`. You just
need to:

* Create a `tests.ts` file in a folder with the name of the rule
  (e.g.: `src/tests/rules/<rule-id>/tests.ts`)

* Have the following template:

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

* You can even specify the status code for the response for
  a specific path:

  <!-- eslint-disable no-unused-vars -->

  ```js
    const serverConfig = {
        '/': 'some HTML here',
        '/site.webmanifest': {
            content: 'The content of the response',
            statusCode: 200
        }
    };
  ```

In the last example, if you don't specify `content`, the response
will be an empty string `''`.

`rule-runner` will automatically test the rule in all the supported
collectors.

## Throwing an error

If you need to force an error in the `collector` when visiting a URL
you just have to make the content `null`. This will force a redirect
to `test://fail`, thus, causing an exception.

## Testing an external url

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

## Execute code `before` or `after` collecting the results

In some scenarios you need to execute some code `before` or `after`
the actual tests (e.g.: if you need to mock a dependency). For those
cases you can use the `before` and `after` properties of `RuleTest`:

```ts
const tests: Array<RuleTest> = [
      {
          after() {
              // Code to execute right before calling `collector.close` goes here.
          }
          before() {
              // Code to execute before the creation of the sonar object here.
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
