# Create a custom rule step-by-step

Imagine that we have a new change in the sonarwhal website - we’d like
to add a footer containing the copyright information `(c) sonarwhal` and
we need to verify that this footer is always present in the page before
deployment. Let’s see how we can write this as a rule for sonarwhal so
that we can use sonarwhal to validate the copyright in the footer for us.

## What is a rule?

First of all, let’s grasp what a rule is and how it works. A rule is at the core
of sonarwhal, it is a check that is used to verify if something was done as
intended. In our example, if a page doesn’t have a footer or has a footer but
misses the `(c) sonarwhal part`, the rule fails. Otherwise it passes. A rule
subscribes to one or more events that are emitted from a connector. A connector
is the way sonarwhal gets the information about a website or a resource using a
browser, or something different that reads files from disk. For example, if a
rule subscribes to `fetch::end::<resource-type>`, it means this rule will run each time the
connector finishes downloading a resource file.

## What is it like to create a new rule?

The recommended way to create a new rule is to use the `—-new-rule` parameter in
CLI. Support for bootstrapping custom rules has shipped in sonarwhal since
v0.20.1. sonarwhal can be installed globally to have access to the sonarwhal
command directly. You can also install it locally and run it via npm scripts or
using the `npx` command.

```bash
npm install -g --engine-strict sonarwhal
```

Afterwards, we navigated to the folder where we’d like to put the rule project,
and then run the command to start a new custom rule:

```bash
sonarwhal --new-rule
```

**Note**: If you are creating a new rule for the main repo you can use
`yarn new:rule` or `npm run new:rule` from the root and it will be created
automatically in the `packages` folder.

At this point, a wizard will ask a series of questions relevant to the new rule,
including the name, description, category, etc. In particular, you will be asked
to select the category of the use case for the new rules. Depending on the
answer, sonarwhal will automatically decide which `event`(s) it should subscribe
the rule to. Of course, you can subscribe to others if needed. The list below
might help if you wonder what those options mean:

* `DOM`: Is your rule checking a particular `DOM` element like `head` or
  `link` ?
* `Resource Request`: Does your rule rely on the loading of a resource like
  `script`, `stylesheet`, or an `image`?
* `Third Party Service`: Does your rule integrate with a third-party service?
* `JavaScript Injection`: Do you need to inject a script in the page and wait
  for the results to execute your test?

In our case, we’d like to check the content of the footer element, so we select
DOM and then type input footer. Wait for a second… Voilà! A new folder called
`rule-validate-footer` is created, with a bunch of templates in it. The main
structure of the folder is like this:

```text
rule-validate-footer
├── src
│   └── rules
│   │      └── validate-footer
│   │             └── validate-footer.ts
│   └── index.ts
└── tests
    └── validate-footer
          └── test.ts
```

The next main thing to do is to populate the `validate-footer.ts` and `test.ts`
with our actual rule and tests. But before that, we need to navigate to the rule
folder and run `npm run init`. This command does two things:

1. install all the dependencies
2. build the project, which compiles the TypeScript to JavaScript in the `dist`
   folder (support for creating JavaScript rules via sonarwhal's CLI will be
   added in a future release, but you can manually do it now).

Do remember that since a compilation is needed, you have to run build every time
after you make changes to the .ts files. Or alternatively, you run `npm run
watch:ts` in the terminal and the project builds itself after each update. *If
your debugger never stops at the break point you set up, it’s very likely
because you forgot to build your project after making changes.*

## How do we write the rule?

Now navigate to `src/rules/validate-footer/validate-footer.ts`. You can see that
there is already some code there. The rule object contains a rule constructor
`create` and a `meta` property. The `create` function returns an object that
defines what event this rule subscribes to. The keys are the name of the events
and values are the validating functions triggered upon the events. In the
generated template by the wizard, the `element::footer` event is already
populated for us so we can focus on implementing the actual validateFooter
function. As shown in the code below, we have access to the footer element in
the page and use that for our check - if the HTML doesn’t include the target
string, we simply file a report by calling `context.report` with the *resource*
(URL), the *element* (footer), and the *error message*. Note that
`context.report` is an asynchronous method, so always use `await`.

```ts
create(context: RuleContext): IRule {
    const stringToBeIncluded = `(c) sonarwhal`;
    const validateFooter = async (elementFound: IElementFound) => {
        const { element, resource } = elementFound;
        const footerHTML = await element.outerHTML();

        debug(`Validating rule validate-footer`);

        if (!footerHTML.includes(stringToBeIncluded)) {
            await context.report(resource, element, `"${stringToBeIncluded}" is not included in the footer.`);
        }
    };

    return {
        'element::footer': validateFooter
    };
}
```

And now run `sonarwhal https://sonarwhal.com` in the terminal and wait for the
scan to complete. Ta-Dah! We get the result below. It reports an error since we
don’t have the `(c) sonarwhal` footer in the sonarwhal.com home page.

```text
https://sonarwhal.com/
line 1  col 8379  Error  "(c) sonarwhal" is not included in the footer.  validate-footer
✖ Found 1 error and 0 warnings

✖ Found a total of 1 error and 0 warnings
```

You might be wondering what if the page doesn’t include a footer at all, then
the `footer::element` event will never be emitted. You can find the completed
code to address this in [validate-footer.ts][validate-footer.ts] of [this
repository][demo-repo-url]. The general idea is to subscribe the rule to another
event `traverse::end`, and validate the existence of the `footer` element at the
end of the DOM tree traversal.

## How do we config the rule?

So what if you decided to change the copyright text content? Altering the rule
itself every time is messy, and sonarwhal makes it easy to add config options
for a rule, You have access to the config properties through
`context.ruleOptions` and you can load the dynamic value of the target string
when the rule is loaded.

In our case, we define a config option with the key of `stringToBeIncluded`. And
if this config is not defined, the target string falls back to `(c) sonarwhal`.
Meanwhile, we also need to specify the JSON schema of the configurable options
in the `meta` part of the rule constructor. This helps the rule to decide if a
config option is valid before using it.

```ts
const rule: IRuleBuilder = {
    create(context: RuleContext): IRule {
        let stringToBeIncluded;

        const loadRuleConfigs = () => {
            // Load Config options.
            stringToBeIncluded = (context.ruleOptions && context.ruleOptions.stringToBeIncluded) || `(c) sonarwhal`;
        };

        const validateFooter = async (elementFound: IElementFound) => { ... };

        loadRuleConfigs();

        return {
            'element::footer': validateFooter
        };
    },
    meta: {
        docs: {
            category: Category.other,
            description: `A new rule to validate footer`
        },
        recommended: false,
        schema: [{
            additionalProperties: false,
            properties: {
                // Define JSON schema for the config options.
                stringToBeIncluded: { type: 'string' }
            }
        }],
        worksWithLocalFiles: true
    }
};

module.exports = rule;
```

Accordingly, when running sonarwhal, we need to pass in the config values. We do
it in the config file for sonarwhal, `.sonarwhalrc` in the root directory. For
example, if we’d like to validate the presence of `(c) sonarwhal.com` in the
footer instead, we define the value of `stringToBeIncluded` in an object
following the severity level.

```json
{
    "validate-footer": [
    "error",
        {
            "stringToBeIncluded": "(c) sonarwhal.com"
        }
    ]
}
```

Now let’s run the rule again and here is what we get. Did you notice that now
instead of checking for `(c) sonarwhal`, the rule reports the missing of `(c)
sonarwhal.com`? Hooray!

```text
https://sonarwhal.com/
line 1  col 8403  Error  "(c) sonarwhal.com" is not included in the footer.  validate-footer
✖ Found 1 error and 0 warnings

✖ Found a total of 1 error and 0 warnings
```

## How do we add the tests?

Navigate to `src/tests/validate-footer/test.ts`, we will start from the
generated template. The testRule method in the ruleRunner takes three
arguments,the *name* of the rule, the *tests*, and the *rule config options*
(optional). The *tests* are defined as an array of objects, with each object
representing a test scenario. By defining `serverConfig` in each test, we are
able to mock the response from a target website and sonarwhal will compare the
actual scanning result with the messages listed in reports. The
`generateHTMLPage` helper function shipped with sonarwhal comes in handy as a
wrapper when you need HTML containing an element of interest. Here is what the
tests look like, three scenarios are mocked:

* A footer exists and it contains the target string. `pass`
* No footer exists in the page.  `fail`
* A footer exists, but it doesn’t contain the target string. `fail`

```ts
const footer = {
    noFooter: ``,
    noProblem: `<footer>(c) sonarwhal</footer>`,
    wrongTextInFooter: `<footer>(c) Sonarwhal</footer>`
};

const defaultTests: Array<IRuleTest> = [
    {
        name: `Footer exists and it contains '(c) sonarwhal'`,
        serverConfig: generateHTMLPage('', footer.noProblem)
    },
    {
        name: `Footer doesn't exist`,
        reports: [{ message: `<footer> element doesn't exist in this page.` }],
        serverConfig: generateHTMLPage('', footer.noFooter)
    },
    {
        name: `Footer exists, but doesn't contain '(c) sonarwhal'`,
        reports: [{ message: `"(c) sonarwhal" is not included in the footer.` }],
        serverConfig: generateHTMLPage('', footer.wrongTextInFooter)
    }
];

// Tests that use the default target string.
ruleRunner.testRule(ruleName, defaultTests);
```

Run `npm run test` in the terminal, and sonarwhal will run them in all the
available connectors.

See the complete code example in [this repository][sonarwhal-external-rule-demo-repo].

[validate-footer.ts]: https://github.com/qzhou1607/sonarwhal-external-rule-demo/blob/9e350afa23e4bd3245745afddc3a0cef4795f60b/src/rules/validate-footer/validate-footer.ts
[demo-repo-url]: https://github.com/qzhou1607/sonarwhal-external-rule-demo
[sonarwhal-external-rule-demo-repo]: https://github.com/qzhou1607/sonarwhal-external-rule-demo
