# How to develop a rule

A `rule` is a check that `sonarwhal` will validate. The API should be
flexible enough to allow you to implement anything you want easily:

* Validate that all links are `HTTPS`.
* Integrate with a third party service.
* Inject JavaScript to execute in the context of the page.
* etc.

If there is something you want to do and you can’t, or it is not clear
how to do it, please open an issue.

## Types of rules

There are 2 types of `rule`s a user can develop:

* `external`: These are `rule`s that are published independently. When a
  `rule` is specific to a domain or use case, it should be external.
* `core`: These are the `rule`s that are shipped with `sonarwhal` directly.
  Before starting to develop a `core rule`, please make sure there is
  an open issue and talk with the maintainers about it.

Both types of `rule`s [work exactly the same](#howruleswork), the only
difference being where they are located.

### Creating an external rule

The easiest wait to create a new rule that will be distributed outside
`sonarwhal` is via the CLI parameter `--new-rule`. You have 2 options:

* Using `sonarwhal` as a global package:

```bash
npm install -g --engine-strict sonarwhal
sonarwhal --new-rule
```

* Using `npx` if you don’t want to install it globally:

  **Windows users:** Currently [`npx` has an issue in this
  platform](https://github.com/npm/npm/issues/17869) and the command will
  not work.

```bash
npx sonarwhal --new-rule
```

In both cases, a wizard will start and ask you a series of questions:

* What’s the name of this rule?
* What’s the description of this rule?

Once answered, it will create a new directory with the name of the rule and
the right infrastructure to get you started. You just have to run
`npm install` in there to get all the dependencies and start working.
Tests will be already configured to use the same infrastructure as the
core rules.

### Working with core rules

#### Creating a core rule

If you are working in `sonarwhal`’s main repository, one of the easiest ways
to get started is to use `sonarwhal`’s CLI, which helps to generate the template
files and insert them at the right location.

First you need to install the CLI:

```bash
npm install -g --engine-strict sonarwhal
```

You can also install it as a `devDependency` if you prefer not to
have it globally.

```bash
npm install -D --engine-strict sonarwhal
```

Then you can proceed to start generating a new rule using the flag `--new-rule`:

```bash
sonarwhal --new-rule
```

This command will start a wizard that will ask you a series of questions
related to this new rule. A complete list of the questions is shown below:

* What’s the name of this new rule?
* Please select the category of this new rule:
  * accessibility
  * interoperability
  * performance
  * pwa
  * security
* What’s the description of this new rule?
* Please select the category of use case:
  * DOM
    * What DOM element does the rule need access to?
  * Resource Request
  * Third Party Service
  * JS injection

Answer these questions and you will end up with a template rule file.
Events determined to be relevant to this use case will be subscribed
to automatically in the script. If this is a core rule, templates for
documentation and tests will be generated, with the [rule index
page](../../user-guide/rules/index.md) under `user guide` updated to
include the new rule item.

#### Remove a core rule from CLI

Similarly, you can also use CLI to remove an existing rule by using the
flag `--remove-rule`:

```bash
sonarwhal --remove-rule
```

You will be asked to type in the normalized name of the rule, and all
files associated with this rule (script, documentation, and tests) will
be removed.

## How rules work

The following is a basic template for a rule (`import` paths might change
depending on the rule type):

```ts
import { Category } from '../../enums/category';
import { IFetchEnd, IRule, IRuleBuilder } from '../../types';
import { RuleContext } from '../../rule-context';

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
        // Your code here.

        const validateFetchEnd = (fetchEnd: IFetchEnd) => {
            // Code to validate the rule on the event fetch::end.
        }

        const validateTargetFetchEnd = (targetFetchEnd: IFetchEnd) => {
            // Code to validate the rule on the event targetfetch::end.
        }

        const validateElement = (element: IElementFound) => {
            // Code to validate the rule on the event element::element-type.
        }

        return {
          'element': validateElement,
          'fetch::end': validateFetchEnd,
          'targetfetch::end': validateTargetFetchEnd
          // As many events as you need, you can see the
          // list of events [here](../connectors/events.md).
      };
    },
    meta: {}
}
```

Rules are executed via [events](../connectors/events.md). There are several
events exposed by the connectors. The way to indicate which ones the rule cares
about is via the method `create`. This method returns an objects whose keys
are the names of the events and the values the event handlers:

```json
{
    "eventName1": "eventHandler1",
    "eventName2": "eventHandler2"
}
```

There is no limit in the number of events a rule can listen to, but you want
to keep it as simple as possible.

Rule constructors receive a `context` object that makes it easier to interact
with the website and report errors.

To report an error, the rule has to do the following:

```ts
await context.report(resource, element, message);
```

* `context.report()` is an asynchronous method, you should always `await`.
* `resource` is the URL of what is being analyzed (HTML, JS, CSS, manifest,
  etc.)
* `element` is the `IAsyncHTMLElement` that triggered the problem. Not always
  necessary. In the case of an image, script, style, it will be an `img`,
  `script`, `link`, etc.

On top or reporting errors, the `context` object exposes more information
to enable more complex scenarios. Some of the following sections describe them.

### The `meta` property

Rules have an object `meta` that defines several properties:

```json
{
    "docs": {
        "category": "Category",
        "description": "string"
    },
    "recommended": "boolean", // If the rule is part of the recommended options
    "schema": ["json schema"], // An array of valid JSON schemas
    "worksWithLocalFiles": "boolean" // If the rule works with `file://`
}
```

One of the most useful properties is `schema`. This property specifies
if the rule allows the user to configure it (other than the severity).
By default it should be an empty array if it doesn't, or an array of
valid [JSON schemas][json schema]. These schemas will be used when
validating a `.sonarwhalrc` file. As long as there is one of the schemas
that passes, the configuration will be valid. This allows writting
simpler templates.

The rule can access the custom configuration via `context.ruleOptions`.

### Change feedback based on browser support

Users can tell `sonarwhal` what browsers are important for them via the
[`browserslist` property in `.sonarwhalrc`][browserconfiguration].
You can have access to the list, and thus modify the feedback of your
rule, via the property `context.targetedBrowsers`.

<!-- eslint-disable no-unused-vars -->

```js
const validate = (fetchEnd) => {
    if (!context.targetedBrowsers.includes('Edge 14')) {
        return;
    }

    // Your validations
};
```

### Reporting an error if not run

Sometimes what a rule checks is mandatory, and if it does not have
the change to test it, it should fail. These are the types of rules
that enforce certain things to be used in a certain way, and if
included, in order for the rule to pass, the expectation should be
that the thing the rule checks for should exist and be valid/used
correctly. Examples here are the rules that check for different fields
of the manifest file. They should not pass if, for example, the web
manifest file doesn't exist (even if there is a rule that checks
exactly that).

The recommended way to implement a rule like this is to subscribe
to the event `scan::end`. If your rule receives that event and has
not run any validation you should report it.

### Evaluate JavaScript in the page context

Sometimes a rule needs to evaluate some JavaScript in the context of
the page. To do that you need to use `context.evaluate`. This method
will always return a `Promise` even if your code does not return one.

One important thing is that your code needs to be wrapped in an
immediate invoked function expression (IIFE)

The following scripts will work:

```js
const script =
`(function() {
    return true;
}())`;

context.evaluate(script);
```

```js
const script =
`(function() {
    return Promise.resolve(true);
}())`;

context.evaluate(script);
```

The following does not:

```js
const script = `return true;`;

context.evaluate(script);
```

```js
const script = `return Promise.resolve(true);`;

context.evaluate(script);
```

### Ignore connectors

If your rule does not work propertly with certain connectors you can
use the property `ignoreConnectors` so it is not run if using them.

<!-- eslint-disable no-unused-vars, object-curly-newline -->

```js
const rule = {
    create(context) {
        // Your code here
    },

    meta: {
        ignoredConnectors: ['jsdom']
    }
};
```

### Interact with other services

You can develop a rule that integrates with other services. `sonarwhal`
integrates with a few like `ssllabs`.

Because these online tools usually take a few seconds to return the
results the guidance is to start the analysis as soon as possible
and then collect the results as late as possible. This means you
will have to listen to `scan::start` and `scan::end` events respectively.
The `create` method of your rule should be similar to the following:

```ts
create(context: RuleContext): IRule {
    /** The promise that represents the connection to the online service. */
    let promise: Promise<any>;

    const start = (data: IScanStartEvent) => {
        // Initialize promise to service here but do not return it.
    };

    const end = (data: IScanEndEvent): Promise<any> => {
        return promise
            .then((results) => {
                // Report any results via `context.report` here.
            })
            .catch((e) => {
                // Always good to handle errors.
            });
    };

    return {
        'scan::start': start,
        'scan::end': end
    };
}
```

In case you need a more complete example, please look at the
`ssllabs.ts` source code.

## How to test a rule

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

### testRule()

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

### Throwing an error

If you need to force an error in the `connector` when visiting a URL
you just have to make the content `null`. This will force a redirect
to `test://fail`, thus, causing an exception.

### Testing an external URL

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

### Execute code `before` or `after` collecting the results

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
            // Code to execute before the creation of the sonarwhal object here.
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

<!-- Link labels: -->

[json schema]: http://json-schema.org/
[browserconfiguration]: ../../user-guide/index.md#browserconfiguration
