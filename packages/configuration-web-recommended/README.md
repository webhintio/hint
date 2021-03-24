# webhint recommended web configuration

To examine development or in-production websites, use
`@hint/configuration-web-recommended`.

> **NOTE**:  This package is for use against any content served from a web
> server.

This `webhint` configuration package is installed automatically by webhint.

To install `webhint`, run the command in the following code snippet.

```bash
npm install hint --save-dev
```

> **NOTE**:  The recommended way of running `webhint` is as a `devDependency`
> of your project.

Copy the following code snippet and add it to your
[.hintrc][UserGuideConfiguringWebhintSummary] file.

```json
{
    "extends": ["web-recommended"]
}
```

The following code snippet is an expanded version of the previous code snippet.

```json
{
    "connector": {
        "name": "puppeteer"
    },
    "extends": [
        "accessibility"
    ],
    "formatters": [
        "html",
        "summary"
    ],
    "hints": {
        "axe": "error",
        "content-type": "error",
        "disown-opener": "error",
        "highest-available-document-mode": "error",
        "html-checker": "error",
        "http-cache": "error",
        "http-compression": "error",
        ...
    },
    "hintsTimeout": 120000
}
```

The following code snippet includes another formatter \(or any other
hint or connector, and so on\).

```json
{
    "extends": ["web-recommended"],
    "formatters": ["codeframe"]
}
```

<!-- links -->

[UserGuideConfiguringWebhintSummary]: https://webhint.io/docs/user-guide/configuring-webhint/summary/ "Configure webhint | webhint"
