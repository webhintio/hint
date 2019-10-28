# webhint's accessibility configuration (`@hint/configuration-accessibility`)

This is a `webhint` configuration package to use for enabling
accessibility hints based on [`axe-core`][axe core] provided
via [hint-axe][hint axe] and it is installed automatically
with webhint:

```bash
npm install hint --save-dev
```

**Note:** The recommended way of running webhint is as a `devDependency` of
your project.

The minimum required [`.hintrc`][hintrc] file to use it is
the following:

```json
{
    "extends": ["accessibility"]
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
        "axe/aria": "error",
        "axe/color": "error",
        "axe/forms": "error",
        ...
    },
    "hintsTimeout": 120000
}
```

If you prefer to use another formatter (or any other hint/connector,
etc.) you can do something like:

```json
{
    "extends": ["accessibility"],
    "formatters": ["codeframe"]
}
```

<!-- Link labels: -->

[axe core]: https://github.com/dequelabs/axe-core/
[hint axe]: https://webhint.io/docs/user-guide/hints/hint-axe/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
