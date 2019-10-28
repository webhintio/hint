# webhint's all configuration (`@hint/configuration-all`)

This is a `webhint` configuration package to use for enabling
all hints.

This package will automatically install all the missing dependencies.

To use it you will have to install it via `npm`:

```bash
npm install @hint/configuration-all --save-dev
```

**Note:** The recommended way of running webhint is as a `devDependency` of
your project.

The minimum required [`.hintrc`][hintrc] file to use it is
the following:

```json
{
    "extends": ["all"]
}
```

and it will be as if you had this:

```json
{
    "connector": "puppeteer",
    "formatters": [
        "html",
        "summary"
    ],
    "hints": {
        "amp-validator": "error",
        "apple-touch-icons": "error",
        "axe/aria": "error",
        "axe/forms": "error",
        "axe/color": "error",
        ...
    },
    "hintsTimeout": 120000
}
```

If you prefer to use another formatter (or any other hint/connector,
etc.) you can do something like:

```json
{
    "extends": ["all"],
    "formatters": ["codeframe"]
}
```

Note: Not all the hints can be used for all connectors,
you will be warned when a hint is going to be ignored
for a connector.

e.g.

```text
Warning: The hint "babel-config/is-valid" will be ignored for the connector "puppeteer"
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
