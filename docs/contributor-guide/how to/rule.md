# Develop a rule

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


<!-- Link labels: -->

[json schema]: http://json-schema.org/
