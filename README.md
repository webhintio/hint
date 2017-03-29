# Sonar [![Build Status](https://travis-ci.com/MicrosoftEdge/Sonar.svg?token=ie6AidxpTLajKCNExwqL&branch=master)](https://travis-ci.com/MicrosoftEdge/Sonar)

## Tasks

* `npm run site -- https://mysite.com` will analyze the website with
   the current configuration and using the latest build available in
   the `dist` folder.
* `npm run lint` will lint the code under `src`.
* `npm run watch` will start watchmode. This is the recommended task
   to run in the background while developing. It does the following:
  * sync all the resources from `src` to `dist` (basically anything
    that is not a `.ts` file).
  * compile the typescript files incrementally to `dist`.
  * run all the tests incrementally.
* `npm run build` will do the same as the `watch` task but only once
  and without running the tests.
* `npm test` will run the tests with code coverage using the code
  available in `dist`. It is better to run this task after `build`.

The initialization of the `watch` task is a bit especial: it will
compile and copy the assets before starting to watch for new files
to copy, build, or test. Because of concurrency, it might be that
the tests are run twice initially.

## How to test rules

Testing a new rule is really easy if you use `rule-runer`. You just
need to:
* Create a `tests.ts` file in a folder with the name of the rule:
`src/tests/rules/ruleid/tests.ts`
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

ruleRunner.testRule('rule-id', tests);
```

`serverConfig` can be of different types depending on your needs:

* `string` containing the response for `/` (HTML, plain text, etc.).
* `object` with paths as properties names and their content as values:
```javascript
{
    '/': 'some HTML here',
    'site.webmanifest': '{ "property1": "value1" }'
}
```
* You can even specify the status code for the response to an specific path:
```javascript
{
    '/': 'some HTML here',
    '/site.webmanifest': {
        statusCode: 404
        content: 'The content of the response'
    }
}
```

In the last example, if you don't specify `content`, the response will be an
empty string `""`;

`rule-runner` allows us to easily test all the rules in all the supported collectors.
