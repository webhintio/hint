# How to interact with other services

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
                    // Report any results via `context.report` here
                })
                .catch((e) => {
                    // Always good to handle errors
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
