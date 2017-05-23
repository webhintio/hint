# How to develop a rule

To create a new rule you just need to:

* Create a `<rule_name>.ts` file in a folder with the same name of the rule
  file (e.g.: `src/rules/<rule_name>/<rule_name>.ts`)

* Have the following template:

  ```ts
  import * from '../../utils/rule-helpers';
  // The list of types depends on the [events](../events/list-of-events.md) you want to capture.
  import { IFetchEndEvent, IRule, IRuleBuilder } from '../../types'; // eslint-disable-line no-unused-vars
  import { RuleContext } from '../../rule-context'; // eslint-disable-line no-unused-vars

  const rule: IRuleBuilder = {
      create(context: RuleContext): IRule {
          // Your code here.

          const validateFetchEnd = (fetchEnd: IFetchEndEvent) => {
              // Code to validate the rule on the event fetch::end.
          }

          const validateTargetFetchEnd = (targetFetchEnd: IFetchEndEvent) => {
              // Code to validate the rule on the event targetfetch::end.
          }

          return {
            'fetch::end': validateFetchEnd,
            'targetfetch::end': validateTargetFetchEnd
            // As many events as you need, you can see the
            // list of events [here](../events/list-of-events.md).
        };
      },
      meta: {}
  }
  ```

> More content here

## Target specific browsers

If your rule only applies to specific browsers you should use
`context.targetedBrowsers` and check if the rule needs to be executed or not.

<!-- eslint-disable no-unused-vars -->

```js
const validateFetchEnd = (fetchEnd) => {
    if (!context.targetedBrowsers.includes('Edge 14')) {
        return;
    }

    // Your validations
};
```

## Reporting an error if not run

Sometimes what a rule checks is mandatory, and if it does not have the change
to test it, it should fail. These are the types of rules that enforce certain things to be used in a certain way, and if included, in order for the rule to pass, the expectation should be that the thing the rule checks for should exist and be valid/used correctly.
Examples here are the rules that check for different fields of the manifest file. They should not pass if, for example, the web manifest file doesn't exist (even if there is a rule that checks exactly that).

The recommended way to implement a rule like this is to subscribe to the
event `scan::end`. If your rule receives that event and has not run any
validation you should report it.

## Interact with other services

You can develop a rule that integrates with other services. Sonar
integrates with a few like `ssllabs`.
Because these online tools usually take a few seconds to return the
results the guidance is to start the analysis as soon as possible
and then collect the results as late as possible. This means you
will have to listen to `scan::start` and `scan::end`
events respectively.
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
},
```

In case you need a more complete example, please look at the `ssllabs.ts`
source code.

## Evaluate JavaScript in the page context

Sometimes a rule needs to evaluate some JavaScript in the context of
the page. To do that you need to use `context.evaluate`. This method
will always return a `Promise` even if your code does not return one.

One important thing is that your code needs to be wrapped in an
immediate invoked function expression (IIFE)

The following scripts will work:

<!-- eslint-disable -->

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

## Ignore collectors

If your rule does not work propertly with certain collectors you can use the
property `ignoreCollectors` so it is not run if using them.

<!-- eslint-disable no-unused-vars, object-curly-newline -->

```js
const rule = {
    create(context) { // Your code here
    },
    meta: {
        ignoredCollectors: ['jsdom']
    }
};
```
