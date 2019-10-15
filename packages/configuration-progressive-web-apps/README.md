# webhint's recommended progressive web apps configuration (`@hint/configuration-progressive-web-apps`)

This packages is a `webhint`'s configuration package to use for
checking progressive web apps (PWAs) and it is installed automatically
by webhint:

**Note:** The recommended way of running webhint is as a `devDependency` of
your project.

The minimum required [`.hintrc`][hintrc] file to use it is
the following:

```json
{
    "extends": ["progressive-web-apps"]
}
```

and it will be as if you had this:

```json
{
    "connector": {
        "name": "puppeteer"
    },
    "formatters": [
        "html",
        "summary"
    ],
    "hints": {
        "apple-touch-icons": "error",
        "manifest-app-name": "error",
        "manifest-exists": "error",
        "manifest-file-extension": "error",
        "manifest-icons": "error",
        "manifest-is-valid": "error",
        ...
    },
    "hintsTimeout": 120000,
    "parsers": [
        "manifest"
    ],
    ...
}
```

If you prefer to use another formatter (or any other hint/connector,
etc.) you can do something like:

```json
{
    "extends": ["progressive-web-apps"],
    "formatters": ["codeframe"]
}
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
