# Develop a rule

A `rule` is a group of related checks `sonarwhal` will validate. The API should
be flexible enough to allow you to implement anything you want easily, e.g.:

* Validate that all links are `HTTPS`.
* Integrate with a third party service.
* Inject JavaScript to execute in the context of the page.
* etc.

If there is something you want to do and you can’t, or it is not clear
how to do it, please [open an issue][new issue].

## Using the `CLI` to create a rule

The easiest wait to create a new rule is via the `create-rule` package:

```bash
npm init rule
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
to automatically in the script.

## How rules work

The following is a basic template for a rule (`import`s might change
depending on the rule type):

```ts
import { Category } from 'sonarwhal/dist/src/lib/enums/category';
import { FetchEnd, IRule, RuleMetadata } from 'sonarwhal/dist/src/lib/types';
import { RuleContext } from 'sonarwhal/dist/src/lib/rule-context';

export default class MyNewRule implements IRule {
    public static readonly meta: RuleMetadata = {}

    public constructor(context: RuleContext) {
        // Your code here.

        const validateFetchEnd = (fetchEnd: FetchEnd) => {
            // Code to validate the rule on the event fetch::end.
        }

        const validateElement = (element: ElementFound) => {
            // Code to validate the rule on the event element::element-type.
        }

        context.on('element', validateElement);
        context.on('fetch::end::*', validateFetchEnd);
        // As many events as you need, you can see the
        // list of events [here](../connectors/events.md).
    }
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

There is no limit to the number of events a rule can listen to, but you want
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
    "id": "rule-id",
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

<!-- Link labels: -->

[custom rule]: ../guides/create-custom-rule.md
[json schema]: http://json-schema.org/
[new issue]: https://github.com/sonarwhal/sonarwhal/issues/new
[npx issue]: https://github.com/npm/npm/issues/17869
