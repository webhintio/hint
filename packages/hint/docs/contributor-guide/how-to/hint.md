# Develop a hint

A `hint` is a group of related checks `webhint` will validate. The API should
be flexible enough to allow you to implement anything you want easily, e.g.:

* Validate that all links are `HTTPS`.
* Integrate with a third party service.
* Inject JavaScript to execute in the context of the page.
* etc.

If there is something you want to do and you can’t, or it is not clear
how to do it, please [open an issue][new issue].

## Using the `CLI` to create a hint

The easiest way to create a new hint is via the `create-hint` package:

```bash
npm init hint
```

This command will start a wizard that will ask you a series of questions
related to this new hint. A complete list of the questions is shown below:

* What’s the name of this new hint?
* Please select the category of this new hint:
  * accessibility
  * development
  * compatibility
  * performance
  * pwa
  * pitfalls
  * security
* What’s the description of this new hint?
* Please select the category of use case:
  * DOM
    * What DOM element does the hint need access to?
  * Resource Request
  * Third Party Service
  * JS injection

Answer these questions and you will end up with a template hint file.
Events determined to be relevant to this use case will be subscribed
to automatically in the script.

## How hints work

The following is a basic template for a hint (`import`s might change
depending on the hint type):

```ts
import { Category } from '@hint/utils-types';
import { FetchEnd, IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { HintContext } from 'hint/dist/src/lib/hint-context';

export default class MyNewHint implements IHint {
    public static readonly meta: HintMetadata = {}

    public constructor(context: HintContext) {
        // Your code here.

        const validateFetchEnd = (fetchEnd: FetchEnd) => {
            // Code to validate the hint on the event fetch::end.
        }

        const validateElement = (element: ElementFound) => {
            // Code to validate the hint on the event element::element-type.
        }

        context.on('element', validateElement);
        context.on('fetch::end::*', validateFetchEnd);
        // As many events as you need
    }
}
```

Hints are executed via [events][events]. There are several
events exposed by the connectors. The way to indicate which ones the hint cares
about is via the method `create`. This method returns an objects whose keys
are the names of the events and the values the event handlers:

```json
{
    "eventName1": "eventHandler1",
    "eventName2": "eventHandler2"
}
```

There is no limit to the number of events a hint can listen to, but you want
to keep it as simple as possible.

Hint constructors receive a `context` object that makes it easier to interact
with the website and report errors.

To report an error, the hint has to do the following:

```ts
context.report(resource, message, { element: element });
```

* `resource` is the URL of what is being analyzed (HTML, JS, CSS, manifest,
  etc.)
* `message` is the text to show to the user about the problem.
* `options` is an (optional) object that can contain the following:
  * `element` is an optional `HTMLElement` where the issue was found
    (used to get a `ProblemLocation` if one was not provided). For example,
    if an image is missing an `alt` attribute, this can be the `img` element.
  * `codeSnippet` is a string of source code to display (defaults to the
    `outerHTML` of `element`).
  * `content` is a string of text within `element` where the issue was found
    (used to refine a `ProblemLocation`).;
  * `location` is an explicit `ProblemLocation` (`{col: number, line: number}`)
     where the issue was found. If used with `element`, it represents an offset
     from the start of that element's content (e.g. for inline CSS in HTML).
  * `severity` overrides the default `Severity` for the hint to determine how
    the issue will be reported (e.g. `Severity.error`).

On top or reporting errors, the `context` object exposes more information
to enable more complex scenarios. Some of the following sections describe them.

### The `meta` property

Hints have an object `meta` that defines several properties:

```json
{
    "docs": {
        "category": "Category",
        "description": "string"
    },
    "id": "hint-id",
    "recommended": "boolean", // If the hint is part of the recommended options
    "schema": ["json schema"], // An array of valid JSON schemas
    "worksWithLocalFiles": "boolean" // If the hint works with `file://`
}
```

One of the most useful properties is `schema`. This property specifies
if the hint allows the user to configure it (other than the severity).
By default it should be an empty array if it doesn't, or an array of
valid [JSON schemas][json schema]. These schemas will be used when
validating a `.hintrc` file. As long as there is one of the schemas
that passes, the configuration will be valid. This allows writting
simpler templates.

The hint can access the custom configuration via `context.hintOptions`.

<!-- Link labels: -->

[custom hint]: ../guides/create-custom-hint.md
[events]: ../getting-started/events.md
[json schema]: http://json-schema.org/
[new issue]: https://github.com/webhintio/hint/issues/new
[npx issue]: https://github.com/npm/npm/issues/17869
