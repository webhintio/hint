# Implement common rule scenarios

This page documents the most common scenarios encoutered when developing a rule
for `sonarwhal`. If there's something that you want to do that is not
documented here, please [open an issue][new issue] so we can help you.

## Change feedback based on browser support

Users can tell `sonarwhal` what browsers are important for them via a
[`browserslist` property added in `.sonarwhalrc`][browserconfiguration] or in
the `package.json` file. You can have access to the list, and thus modify
the feedback of your rule, via the property `context.targetedBrowsers`.

<!-- eslint-disable no-unused-vars -->

```js
const validate = (fetchEnd) => {
    if (!context.targetedBrowsers.includes('Edge 14')) {
        return;
    }

    // Your validations
};
```

## Reporting an error if not run

Sometimes what a rule checks is mandatory, and if it does not have
the chance to test it, it should fail. These are the types of rules
that enforce certain things to be used in a certain way, and if
included, in order for the rule to pass, the expectation should be
that the thing the rule checks for should exist and be valid/used
correctly.

For example, there could be a rule that checks that a particular
JavaScript file is loaded (an analytics library). If it isn't, it
should fail.

The recommended way to implement a rule like this is to subscribe
to the event `scan::end`. If the rule receives that event and has
not run any validation it should report an issue.

## Evaluate JavaScript in the page context

Sometimes a rule needs to evaluate some JavaScript in the context of
the page. To do that you need to use `context.evaluate`. This method
will always return a `Promise` even if your code does not return one.

One important thing is that your code needs to be wrapped in an
immediate invoked function expression (IIFE).

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

## Ignore connectors

If your rule does not work properly with certain connectors you can
use the property `ignoreConnectors` so it is not run when they are used.

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

## Interact with other services

You can develop a rule that integrates with other services. `sonarwhal`
integrates with a few such as `ssllabs`.

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
[`ssllabs.ts` source code][ssllabs code].

## Validate JavaScript

To create a rule that understands JavaScript you will need to use the
event `parser::javascript` emitted by the [`javascript parser`][parsers].
This event is of type `IScriptParse` which has the following information:

* `resource`: the parsed resource. If the JavaScript is in a `<script> tag`
  and not a file, the value will be `Internal javascript`.
* `sourceCode`: a `eslint` `SourceCode` object.

Here is an example rule that use the parser:

```ts
import * as eslint from 'eslint';

const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
        let validPromise;
        const errorsOnly = context.ruleOptions && context.ruleOptions['errors-only'] || false;
        let html;

        const onParseJavascript = async (scriptParse: IScriptParse) => {
            const results = linter.verify(scriptParse.sourceCode, {
                rules: {
                    semi: 2
                }
            });

            for (const result of results) {
                await context.report(scriptParse.resource, null, result.message);
            }
        };

        return {
            'parse::javascript': onParseJavascript
        };
    },
    meta: {
        docs: {
            category: Category.interoperability,
            description: `Check if your scripts use semicolon`
        },
        recommended: false,
        schema: [],
        worksWithLocalFiles: true
    }
};
```

And when writing tests, you need to specify the parsers that you need:

```ts
ruleRunner.testRule(ruleName, tests, {
    parsers: ['javascript']
});
```

<!-- Link labels: -->

[browserconfiguration]: ../../user-guide/index.md#browserconfiguration
[new issue]: https://github.com/sonarwhal/sonarwhal/issues/new
[parsers]: ../../user-guide/concepts/parser.md
[ssllabs code]: https://github.com/sonarwhal/sonarwhal/blob/master/src/lib/rules/ssllabs/ssllabs.ts
