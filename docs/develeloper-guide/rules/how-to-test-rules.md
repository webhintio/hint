# How to test rules

Testing a new rule is really easy if you use `rule-runner.ts`. You just
need to:

* Create a `tests.ts` file in a folder with the name of the rule
(e.g.: `src/tests/rules/<rule-id>/tests.ts`)

* Have the following template:

  ```typescript
  import { Rule } from '../../../../lib/types'; // eslint-disable-line no-unused-vars
  import { RuleTest } from '../../../helpers/rule-test-type'; // eslint-disable-line no-unused-vars

  import * as ruleRunner from '../../../helpers/rule-runner';

  const tests: Array<RuleTest> = [
      {
          name: 'Name of the tests',
          serverConfig: 'HTML to use',
          reports: [{
              message: 'Message the error will have',
              position: { column: 0, line: 0 } // Where the error will show
          }]
      },
      { ... }
  ];

  ruleRunner.testRule('<rule-id>', tests);
  ```

`serverConfig` can be of different types depending on particular needs:

* `string` containing the response for `/` (HTML, plain text, etc.).
* `object` with paths as properties names and their content as values:

  ```js
  {
    '/': 'some HTML here',
    'site.webmanifest': '{ "property1": "value1" }'
  }
  ```

* You can even specify the status code for the response for
  a specific path:

  ```js
  {
      '/': 'some HTML here',
      '/site.webmanifest': {
          statusCode: 200,
          content: 'The content of the response'
      }
  }
  ```

In the last example, if you don't specify `content`, the response
will be an empty string `''`.

`rule-runner` allows us to easily test all the rules in all the
supported collectors.
