# Implement common hint scenarios

This page documents the most common scenarios encoutered when developing a hint
for `webhint`. If there's something that you want to do that is not
documented here, please [open an issue][new issue] so we can help you.

## Change feedback based on browser support

Users can tell `webhint` what browsers are important for them via a
[`browserslist` property added in `.hintrc`][browserconfiguration] or in
the `package.json` file. Hints can access this list (and modify their feedback)
via the property `content.targetedBrowsers`.

You can have access to the list, and thus modify
the feedback of your hint, via the property `context.targetedBrowsers`.

```js
const validate = (fetchEnd) => {
    if (!context.targetedBrowsers.includes('Edge 14')) {
        return;
    }

    // Your validations
};
```

## Reporting an error if not run

Sometimes what a hint checks is mandatory, and if it does not have
the chance to test it, it should fail. These are the types of hints
that enforce certain things to be used in a certain way, and if
included, in order for the hint to pass, the expectation should be
that the thing the hint checks for should exist and be valid/used
correctly.

For example, there could be a hint that checks that a particular
JavaScript file is loaded (an analytics library). If it isn't, it
should fail.

The recommended way to implement a hint like this is to subscribe
to the event `scan::end`. If the hint receives that event and has
not run any validation it should report an issue.

## Evaluate JavaScript in the page context

Sometimes a hint needs to evaluate some JavaScript in the context of
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

If your hint does not work properly with certain connectors you can
use the property `ignoreConnectors` so it is not run when they are used.

```ts
export default class MyHint implements IHint {
    public static readonly meta: HintMetadata = {
        id: 'my-hint',
        ignoredConnectors: ['jsdom']
    }

    public constructor(context: HintContext) {
        // Your code here
    }
}
```

## Interact with other services

You can develop a hint that integrates with other services. `webhint`
integrates with a few such as `ssllabs`.

Because these online tools usually take a few seconds to return the
results the guidance is to start the analysis as soon as possible
and then collect the results as late as possible. This means you
will have to listen to `scan::start` and `scan::end` events respectively.
The `create` method of your hint should be similar to the following:

```ts
export default class MyHint implements IHint {
    public static readonly meta: HintMetadata = {
        id: 'my-hint'
    }

    public constructor(context: HintContext) {
        /** The promise that represents the connection to the online service. */
        let promise: Promise<any>;

        const start = (data: ScanStartEvent) => {
            // Initialize promise to service here but do not return it.
        };

        const end = (data: ScanEndEvent): Promise<any> => {
            return promise
                .then((results) => {
                    // Report any results via `context.report` here.
                })
                .catch((e) => {
                    // Always good to handle errors.
                });
        };

        context.on('scan::start', start);
        context.on('scan::end', end);
    }
}
```

In case you need a more complete example, please look at the
[`ssllabs.ts` source code][ssllabs code].

## Validate JavaScript

To create a hint that understands JavaScript you will need to use the
event `parse::javascript` emitted by the [`javascript parser`][parsers].
This event is of type `IScriptParse` which has the following information:

* `resource`: the parsed resource. If the JavaScript is in a `<script> tag`
  and not a file, the value will be `Internal javascript`.
* `sourceCode`: a `eslint` `SourceCode` object.

Here is an example hint that use the parser:

```ts
import * as eslint from 'eslint';

export default class ScriptSemiColonHint implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.compatibility,
            description: `Check if your scripts use semicolon`
        },
        id: 'script-semicolon',
        recommended: false,
        schema: [],
        worksWithLocalFiles: true
    }

    public constructor(context: HintContext) {
        let validPromise;
        const errorsOnly = context.hintOptions && context.hintOptions['errors-only'] || false;
        let html;

        const onParseJavascript = async (scriptParse: ScriptParse) => {
            const results = linter.verify(scriptParse.sourceCode, {
                hints: {
                    semi: 2
                }
            });

            for (const result of results) {
                context.report(scriptParse.resource, null, result.message);
            }
        };

        context.on('parse::javascript', onParseJavascript);
    }
}
```

And when writing tests, you need to specify the parsers that you need:

```ts
hintRunner.testHint(hintPath, tests, {
    parsers: ['javascript']
});
```

<!-- Link labels: -->

[browserconfiguration]: ../../user-guide/configuring-webhint/browser-context.md
[new issue]: https://github.com/webhintio/hint/issues/new
[parsers]: ../../user-guide/concepts/parsers.md
[ssllabs code]: https://github.com/webhintio/hint/blob/main/packages/hint-ssllabs/src/hint.ts
