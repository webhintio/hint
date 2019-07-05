# webhint's accessibility configuration (`@hint/configuration-accessibility`)

This is a `webhint` configuration package to use for enabling
accessibility hints based on [`axe-core`][axe core] provided
via [hint-axe][hint axe].

This package will automatically install all the missing dependencies.

To use it you will have to install it via `npm`:

```bash
npm install @hint/configuration-accessibility
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

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
