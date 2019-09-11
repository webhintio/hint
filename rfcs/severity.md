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

The browser extension or the online scanner do not have the possibility to change
the severity. What's more, a lot of users rely in the provided configurations
(e.g.: `configuration-web-recommended`).

The problem with this is that it is difficult for developers to know what is really
important and should be fixed right away, and what is not as relevant:

> If everything is important, then nothing is.

On top of that:

* there are hints that report several message and not all of them have
the same importance
* some hints do not respect the user's severity for some of the messages

This RFC proposes significant changes to the way the severity is treated in webhint
so we provide more actionable feedback and help developers be more succesfull.

## Proposal

**TL;DR;**

Have hints report with the same severity accross all the different mediums (cli,
vs code, browser extension, and online scanner) by:

1. Changing the available severity levels for hints.
1. Making hints responsible of setting the severity for each report.
1. Letting users change only if a hint is enable or disable (plus some extra
   configuration in the applicable hints).

### Hint severity level

The idea is to get closer to the severity options available in
[VS Code](https://code.visualstudio.com/api/references/vscode-api#DiagnosticSeverity):

| Severity | Description |
| -------- | ----------- |
| off      | Disabled, no reporting will come from it |
| error    | Something that the user should get fixed right away |
| warning  | Something that the developer should probably look into |
| hint*    | Something minor to look into if you have time |
| information* | FYI for the user |

The new values are `hint` and `information`.

**Note:** Not sure about the `information` value. Will revisit once we have the severity
for each hint message

### Hint severity

As mentioned previously, there are a few hints that report multiple things were the
relevance is not the same. An example would be `http-compression` where we report about:

* Not using compression
* Using compression on binaries
* Not using brotli
* Not respecting `Accept-Encoding: identity`

Probably the first 2 should be `error`, `brotli` a `warning` or a `hint` and the one about
`identity` a `hint` or `information`.

Having all the reports with the same severity does not help the user focus on what's
important (have compression enabled for only text based resources
([see GitHub comment](https://github.com/webhintio/hint/issues/2919#issuecomment-530190038))

**Other examples here**

### User configuration

With the proposed changes, a user will only be able to decide which hints are enabled or not.
The user configuration will then look like this:

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
        "content-type": "on",
        ...
        "no-vulnerable-javascript-libraries": ["on", {
            "severity": "high"
        }]
    }
}
```

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
}
```
