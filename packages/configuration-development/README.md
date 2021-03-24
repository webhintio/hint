# webhint development configuration

To examine your raw source, use `@hint/configuration-development`.

> **NOTE**:  To examine development and live websites, use
> `@hint/configuration-web-recommended`.

This `webhint` configuration package is installed automatically by webhint.

To install `webhint`, run the command in the following code snippet.

```bash
npm install hint --save-dev
```

> **NOTE**:  The recommended way of running webhint is as a `devDependency` of
> your project.

Copy the following code snippet and add it to your
[.hintrc][UserGuideConfiguringWebhintSummary] file.

```json
{
    "extends": ["development"]
}
```

The following code snippet is an expanded version of the previous code snippet.

```json
{
    "connector": "local",
    "extends": [
        "accessibility",
        "progressive-web-apps"
    ],
    "formatters": [
        "html",
        "summary"
    ],
    "hints": {
        "axe": "error",
        "babel-config/is-valid": "error",
        "disown-opener": "error",
        "highest-available-document-mode": "error",
        "manifest-exists": "off",
        "meta-charset-utf-8": "error",
        "meta-viewport": "error",
        ...
    },
    "hintsTimeout": 10000
}
```

The following code snippet includes another formatter \(or any other
hint or connector, and so on\).

```json
{
    "extends": ["development"],
    "formatters": ["codeframe"]
}
```

<!-- links -->

[UserGuideConfiguringWebhintSummary]: https://webhint.io/docs/user-guide/configuring-webhint/summary/ "Configure webhint | webhint"
