# webhint's recommended web configuration (`@hint/configuration-web-recommended`)

This packages is a `webhint`'s configuration package to use in
production websites and it is installed automatically by webhint:

```bash
npm install hint --save-dev
```

**Note:** The recommended way of running webhint is as a `devDependency` of
your project.

The minimum required [`.hintrc`][hintrc] file to use it is
the following:

```json
{
    "extends": ["web-recommended"]
}
```

and it will be as if you had this:

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

If you prefer to use another formatter (or any other hint/connector,
etc.) you can do something like:

```json
{
    "extends": ["web-recommended"],
    "formatters": ["codeframe"]
}
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
