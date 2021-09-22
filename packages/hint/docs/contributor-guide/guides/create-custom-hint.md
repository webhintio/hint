# Create a custom hint step-by-step

Imagine that we have a new change in the webhint website - we’d like
to add a footer containing the copyright information `(c) webhint` and
we need to verify that this footer is always present in the page before
deployment. Let’s see how we can write this as a hint for webhint so
that we can use webhint to validate the copyright in the footer for us.

## What is a hint?

First of all, let’s grasp what a hint is and how it works. A hint is at
the core of webhint, it is a check that is used to verify if something
was done as intended. In our example, if a page doesn’t have a footer or
has a footer but misses the `(c) webhint part`, the hint fails. Otherwise
it passes. A hint subscribes to one or more events that are emitted from
a connector. A connector is the way webhint gets the information about
a website or a resource using a browser, or something different that reads
files from disk. For example, if a hint subscribes to `fetch::end::<resource-type>`,
it means this hint will run each time the connector finishes downloading
a resource file.

## What is it like to create a new hint?

The recommended way to create a new hint is to use `npm create hint` from
the CLI.

>**Note for core hints**: If you are creating a hint for the main repo you should
>follow the below steps:
>
>* Make sure to run `yarn` and `yarn build` in root directory.
>* Then go to `create-hint` package ( `cd packages/create-hint` ).
>* Make executable release. run `yarn webpack`.
>* Now run `npm create hint` from `packages` folder.
>
>The generated files will be
>slightly different (references and task will change a bit).

At this point, a wizard will ask a series of questions relevant to the new hint,
including the name, description, category, etc. In particular, you will be asked
to select the category of the use case for the new hints. Depending on the
answer, webhint will automatically decide which `event`(s) it should subscribe
the hint to. Of course, you can subscribe to others if needed. The list below
might help if you wonder what those options mean:

* `DOM`: Is your hint checking a particular `DOM` element like `head` or
  `link` ?
* `Resource Request`: Does your hint rely on the loading of a resource like
  `script`, `stylesheet`, or an `image`?
* `Third Party Service`: Does your hint integrate with a third-party service?
* `JavaScript Injection`: Do you need to inject a script in the page and wait
  for the results to execute your test?

In our case, we’d like to check the content of the footer element, so we select
DOM and then type input footer. Wait for a second… Voilà! A new folder called
`hint-validate-footer` is created, with a bunch of templates in it. The main
structure of the folder is like this:

```text
hint-validate-footer
├── src
│   └── hints
│   │      └── validate-footer
│   │             └── validate-footer.ts
│   └── index.ts
└── tests
    └── validate-footer
          └── test.ts
```

The next main thing to do is to populate the `validate-footer.ts` and `test.ts`
with our actual hint and tests. But before that, we need to navigate to the hint
folder and run `npm run init`. This command does two things:

1. Install all the dependencies.
2. Build the project, which compiles the TypeScript to JavaScript in the `dist`
   folder (support for creating JavaScript hints via webhint's CLI will be
   added in a future release, but you can manually do it now).

**Note for core hints**: Instead of running `npm run init` run `yarn` and
`yarn build`. `webhint` is a monorepo built on top of `yarn` workspaces and this
is the proper way to link the modules.

Do remember that since a compilation is needed, you have to build every time
after you make changes to the `.ts` files. Or alternatively, you run `npm run
watch:ts` in the terminal and the project builds itself after each update. *If
your debugger never stops at the break point you set up, it’s very likely
because you forgot to build your project after making changes.*

## How do we write the hint?

Now navigate to `src/hints/validate-footer/validate-footer.ts`. You can see that
there is already some code there. The hint class contains a constructor
`constructor` and a static property `meta`.
At the end of the `constructor`, it use `context.on` to subscribe the hint
to events the hint needs to listen to. The parameters for  `contexts.on` are the
name of the event and the validating function triggered upon the
events. In the generated template by the wizard, the `element::footer` event is
already populated for us so we can focus on implementing the actual
validateFooter function. As shown in the code below, we have access to the
footer element in the page and use that for our check - if the HTML doesn’t
include the target string, we simply file a report by calling `context.report`
with the *resource* (URL), the *element* (footer), and the *error message*.

```ts
export default class FooterHint implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.other,
            description: `A hint to validate footer`
        },
        id: 'footer',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {
        const stringToBeIncluded = `(c) webhint`;
        const validateFooter = (elementFound: ElementFound) => {
            const { element, resource } = elementFound;
            const footerHTML = element.outerHTML;

            debug(`Validating hint validate-footer`);

            if (!footerHTML.includes(stringToBeIncluded)) {
                const message = `"${stringToBeIncluded}" is not included in the footer.`;

                context.report(resource, message, { element });
            }
        };

        context.on('element::footer', validateFooter);
    }
}
```

And now run `hint https://webhint.io` in the terminal and wait for the
scan to complete. Ta-Dah! We get the result below. It reports an error since we
don’t have the `(c) webhint` footer in the webhint.io home page.

```text
https://webhint.io/
line 1  col 8379  Error  "(c) webhint" is not included in the footer.  validate-footer
✖ Found 1 error and 0 warnings

✖ Found a total of 1 error and 0 warnings
```

You might be wondering what if the page doesn’t include a footer at all, then
the `footer::element` event will never be emitted. You can find the completed
code to address this in [validate-footer.ts][validate-footer.ts] of [this
repository][demo-repo-url]. The general idea is to subscribe the hint to another
event `traverse::end`, and validate the existence of the `footer` element at the
end of the DOM tree traversal.

## How do we config the hint?

So what if you decided to change the copyright text content? Altering the hint
itself every time is messy, and webhint makes it easy to add config options
for a hint, You have access to the config properties through
`context.hintOptions` and you can load the dynamic value of the target string
when the hint is loaded.

In our case, we define a config option with the key of `stringToBeIncluded`. And
if this config is not defined, the target string falls back to `(c) webhint`.
Meanwhile, we also need to specify the JSON schema of the configurable options
in the `meta` part of the hint constructor. This helps the hint to decide if a
config option is valid before using it.

```ts
export default class CopyrightHint implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.other,
            description: `A new hint to validate footer`
        },
        id: 'copyright',
        schema: [{
            additionalProperties: false,
            properties: {
                // Define JSON schema for the config options.
                stringToBeIncluded: { type: 'string' }
            }
        }],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {
        let stringToBeIncluded;

        const loadHintConfigs = () => {
            // Load Config options.
            stringToBeIncluded = (context.hintOptions && context.hintOptions.stringToBeIncluded) || `(c) webhint`;
        };

        const validateFooter = async (elementFound: ElementFound) => { /* ... */ };

        loadHintConfigs();

        context.on('element::footer', validateFooter);
    }
}
```

Accordingly, when running webhint, we need to pass in the config values. We do
it in the config file for webhint, `.hintrc` in the root directory. For
example, if we’d like to validate the presence of `(c) webhint.com` in the
footer instead, we define the value of `stringToBeIncluded` in an object
following the severity level.

```json
{
    "validate-footer": [
    "error",
        {
            "stringToBeIncluded": "(c) webhint.io"
        }
    ]
}
```

Now let’s run the hint again and here is what we get. Did you notice that now
instead of checking for `(c) webhint`, the hint reports the missing of `(c)
webhint.io`? Hooray!

```text
https://webhint.io/
line 1  col 8403  Error  "(c) webhint.io" is not included in the footer.  validate-footer
✖ Found 1 error and 0 warnings

✖ Found a total of 1 error and 0 warnings
```

## How do we add the tests?

Navigate to `src/tests/validate-footer/test.ts`, we will start from the
generated template. The `testHint` method in the hintRunner takes three
arguments,the *name* of the hint, the *tests*, and the *hint config options*
(optional). The *tests* are defined as an array of objects, with each object
representing a test scenario. By defining `serverConfig` in each test, we are
able to mock the response from a target website and webhint will compare the
actual scanning result with the messages listed in reports. The
`generateHTMLPage` helper function shipped with webhint comes in handy as a
wrapper when you need HTML containing an element of interest. Here is what the
tests look like, three scenarios are mocked:

* A footer exists and it contains the target string. `pass`
* No footer exists in the page.  `fail`
* A footer exists, but it doesn’t contain the target string. `fail`

```ts
const footer = {
    noFooter: ``,
    noProblem: `<footer>(c) webhint</footer>`,
    wrongTextInFooter: `<footer>(c) webhint</footer>`
};

const defaultTests: HintTest[] = [
    {
        name: `Footer exists and it contains '(c) webhint'`,
        serverConfig: generateHTMLPage('', footer.noProblem)
    },
    {
        name: `Footer doesn't exist`,
        reports: [{ message: `<footer> element doesn't exist in this page.` }],
        serverConfig: generateHTMLPage('', footer.noFooter)
    },
    {
        name: `Footer exists, but doesn't contain '(c) webhint'`,
        reports: [{ message: `"(c) webhint" is not included in the footer.` }],
        serverConfig: generateHTMLPage('', footer.wrongTextInFooter)
    }
];

// Tests that use the default target string.
hintRunner.testHint(hintPath, defaultTests);
```

Run `npm run test` in the terminal, and webhint will run them in all the
available connectors.

See the complete code example in [this repository][webhint-external-rule-demo-repo].

[validate-footer.ts]: https://github.com/qzhou1607/sonarwhal-external-rule-demo/blob/9e350afa23e4bd3245745afddc3a0cef4795f60b/src/rules/validate-footer/validate-footer.ts
[demo-repo-url]: https://github.com/qzhou1607/sonarwhal-external-rule-demo
[webhint-external-rule-demo-repo]: https://github.com/qzhou1607/sonarwhal-external-rule-demo
