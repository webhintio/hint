# Develop a formatter

A `formatter` formats the results of `sonarwhal`: from crafting `JSON` to
connecting to a database and storing the results in it.

To create one, you will need a class that implements the interface
`IFormatter`. This inteface has a method `format` witch will receive an
array of `message`s if any issues have been found.

The following is a basic `formatter` that `.stringify()`s the results:

```js
export default class JSONFormatter implements IFormatter {
    public format(messages: Array<Problem>) {
        console.log(JSON.stringify(messages, null, 2));
    }
}
```

A `message` looks like this:

```json
{
    "column": "number", // The column number where the issue was found if applicable.
    "line": "number", // The line number where the issue was found if applicable.
    "message": "string", // The human friendly detail of the error.
    "resource": "string", // The URL or name of the asset with the issue.
    "severity": "number" // 1 (warning), 2 (error).
}
```

With this, you can group the issues by `resource` and sort them by
`line` and `column`. Using the previous example and `lodash` will
look as follows:

```js
import * as _ from 'lodash';

export default class JSONFormatter implements IFormatter {
    /** Format the problems grouped by `resource` name and sorted by line and column number */
    public format(messages: Array<Problem>) {
        const resources = _.groupBy(messages, 'resource');

        _.forEach(resources, (msgs, resource) => {
            const sortedMessages = _.sortBy(msgs, ['line', 'column']);

            console.log(`${resource}: ${msgs.length} issues`);
            console.log(JSON.stringify(sortedMessages, null, 2));
        });
    }
}
```

You can always check the code of any of the official `formatter`s for
more complex scenarios.
