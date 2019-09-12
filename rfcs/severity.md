# Severity of hints

## Current status

Hints have an associated severity (`off`, `warning`, `error`) that can be set
via a `.hintrc` file when using the CLI. E.g.:

```json
{
    "hints": {
        "hint-name": "error"
    }
}
```

The browser extension or the online scanner do not have the possibility to
change the severity. What's more, a lot of users rely in the provided
configurations (e.g.: `configuration-web-recommended`).

The problem with this is that it is difficult for developers to know what is
really important and should be fixed right away, and what is not as relevant:

> If everything is important, then nothing is.

On top of that:

* there are hints that report several message and not all of them have the
  same importance
* some hints do not respect the user's severity for some of the messages

This RFC proposes significant changes to the way the severity is treated in
webhint so we provide more actionable feedback and help developers be more
succesfull.

## Proposal

**TL;DR;**

Have hints report with the same severity accross all the different mediums
(cli, vs code, browser extension, and online scanner) by:

1. Changing the available severity levels for hints.
1. Making hints responsible of setting the severity for each report.
1. Letting users change only if a hint is enable or disable (plus some extra
   configuration in the applicable hints).

### Hint severity level

The idea is to get closer to the severity options available in
[VS Code](https://code.visualstudio.com/api/references/vscode-api#DiagnosticSeverity):

<!-- markdownlint-disable -->

| Severity | Description | VS Code | Browser |
| -------- | ----------- | ------- | ------- |
| off      | Disabled, no reporting will come from it | | |
| error    | Something that the user should get fixed right away | ![vs code error](https://user-images.githubusercontent.com/606594/64741804-bf46d880-d4ae-11e9-91a1-1db1b60d29a5.png) | TBD |
| warning  | Something that the developer should probably look into | ![vs code warning](https://user-images.githubusercontent.com/606594/64741875-ff0dc000-d4ae-11e9-8668-eecea56d418d.png) | TBD |
| hint*    | Something minor to look into if you have time | ![vs code hint](https://user-images.githubusercontent.com/606594/64741963-6166c080-d4af-11e9-825e-47bb2ca60a26.png) | TBD |
| information* | FYI for the user | ![vs code information](https://user-images.githubusercontent.com/606594/64741926-2cf30480-d4af-11e9-88fe-01e4d9d7d36c.png) | TBD |

<!-- markdownlint-enable -->

The new values are `hint` and `information`.

**Notes:**

* We don't have to add 2 new severity levels, we could decide after reviewing
  the reports of the hints if it makes sense.
* In VS Code, `Hint` is less intrussive than `Information`. We will have to
  decide if we swap them or if we are ok as that (in the description about it
  doesn't quite match the expectations I think).

### Hint severity

As mentioned previously, there are a few hints that report multiple things
were the relevance is not the same. An example would be `http-compression`
where we report about:

* Not using compression
* Using compression on binaries
* Not using brotli
* Not respecting `Accept-Encoding: identity`

Probably the first 2 should be `error`, `brotli` a `warning` or a `hint` and
the one about `identity` a `hint` or `information`.

Having all the reports with the same severity does not help the user focus on
what's important (have compression enabled for only text based resources
([see GitHub comment](https://github.com/webhintio/hint/issues/2919#issuecomment-530190038))

> Other examples here

### User configuration

With the proposed changes, a user will only be able to decide which hints are
enabled or not. The user configuration will then look like this:

```json
{
    "connector": {
        "name": "puppeteer",
        "options": {
            "waitUntil": "networkidle2"
        }
    },
    "hintsTimeout": 120000,
    "hints": {
        "amp-validator": "off",
        "apple-touch-icons": "on",
        "button-type": "off",
        "content-type": ["on", {
            ".*\\.js": "application/javascript; charset=utf-8"
        }],
        ...
        "no-vulnerable-javascript-libraries": "on"
    }
}
```

If the value of a `hint` key is an array, then the first member should be
`"on|off"` and the second and object with the specific configuration for
that `hint`. Please note that not all hints accept further configurations.

In the example above we are using `content-type` but other examples of hints
that accept configurations are: `axe`, `http-compression`, `compat-api`, etc.

As a shortcut, the property `hints` could accept an array of hint names that
will be turned on:

```json
{
    "connector": {
        "name": "puppeteer",
        "options": {
            "waitUntil": "networkidle2"
        }
    },
    "hintsTimeout": 120000,
    "hints": [
        "apple-touch-icons",
        "content-type",
        ...
        "no-vulnerable-javascript-libraries"
    ]
}
```

#### Exit code and verbosity level

Because now hints will be responsible of setting the severity of each report,
the user will need a way to filter out the messages they are not concerned
about. To achieve that a new property `minimumSeverity` will be added to the
`.hintrc`:

```json
{
    "connector": {
        "name": "puppeteer",
        "options": {
            "waitUntil": "networkidle2"
        }
    },
    "hintsTimeout": 120000,
    "hints": [
        "apple-touch-icons",
        "content-type",
        ...
        "no-vulnerable-javascript-libraries"
    ],
    "minimumSeverity": "error|warning|hint|information"
}
```

If the user selects `error`, all reports with a different severity will not be
outputed.
If they select `warning`, `error` and `warning` errors will be reported.
If a user selects `warning` and there are only `warning` reports, the
exit code should be different than 0.
