# Develop a formatter

A `formatter` formats the results of `webhint`: from crafting `JSON` to
connecting to a database and storing the results in it.

To create one, you will need a class that implements the interface
`IFormatter`. This interface has an `async` method `format` that
receives an array of `message`s if any issues have been found.

The following is a basic `formatter` that `.stringify()`s the results:

<!-- eslint-disable require-await -->

```js
export default class JSONFormatter implements IFormatter {
    public async format(messages: Problem[], options: FormatterOptions = {}) {
        console.log(JSON.stringify(messages, null, 2));
    }
}
```

<!-- eslint-enable require-await -->

A `message` looks like this:

```json
{
    "location": {
        "column": "number", // The column number where the issue was found if applicable.
        "line": "number", // The line number where the issue was found if applicable.
    },
    "message": "string", // The human friendly detail of the error.
    "sourceCode": "string", // The piece of code where the issue was found if applicable.
    "resource": "string", // The URL or name of the asset with the issue.
    "hintId": "string", // The name of the triggered hint.
    "category": "Category", // The category of the triggered hint. Where type `Category` is enum of values : 'accessibility', 'development', 'compatibility', 'other', 'pwa', 'performance', 'pitfalls' and 'security'.
    "severity": "Severity", // The severity of the hint based on the actual configuration. Where type `Severity` is enum of values : 'off', 'warning' and 'error'.
    "codeLanguage": "string" // The language of the sourceCode if applicable.
}
```

With this, you can group the issues by `resource` and sort them by
`location.line` and `location.column`.

Using the previous example and `lodash`, `formatter` will look as follows:

<!-- eslint-disable require-await -->

```js
import * as _ from 'lodash';

export default class JSONFormatter implements IFormatter {
    /** Format the problems grouped by `resource` name and sorted by line and column number */
    public async format(messages: Problem[], options: FormatterOptions = {}) {
        const resources = _.groupBy(messages, 'resource');

        _.forEach(resources, (msgs, resource) => {
            const sortedMessages = _.sortBy(msgs, ['location.line', 'location.column']);

            console.log(`${resource}: ${msgs.length} issues`);
            console.log(JSON.stringify(sortedMessages, null, 2));
        });
    }
}
```

<!-- eslint-enable require-await -->

The `options` parameter is as follows:

```ts
export type FormatterOptions = {
    config?: UserConfig;
    /** Start time (queued in online scanner) ISO string */
    date?: string;
    isScanner?: boolean;
    /** Language used for localization */
    language?: string;
    noGenerateFiles?: boolean;
    /** The file to use to output the results requested by the user */
    output?: string;
    resources?: HintResources;
    /** The time it took to analyze the URL */
    scanTime?: number;
    status?: string;
    /** The analyzed URL */
    target?: string;
    /** webhint's version */
    version?: string;
};
```

You can always check the code of any of the official `formatter`s for
more complex scenarios.
