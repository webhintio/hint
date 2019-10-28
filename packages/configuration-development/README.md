# webhint's development configuration (`@hint/configuration-development`)

This packages is a `webhint` configuration package to use during
development  and it is installed automatically by webhint:

```bash
npm install hint --save-dev
```

**Note:** The recommended way of running webhint is as a `devDependency` of
your project.

The minimum required [`.hintrc`][hintrc] file to use it is
the following:

```json
{
    "extends": ["development"]
}
```

and it will be as if you had this:

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

If you prefer to use another formatter (or any other hint/connector,
etc.) you can do something like:

```json
{
    "extends": ["development"],
    "formatters": ["codeframe"]
}
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
