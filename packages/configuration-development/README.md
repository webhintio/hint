# webhint's development configuration (`@hint/configuration-development`)

This packages is a `webhint` configuration package to use during
development.

This package will automatically install all the missing dependencies.

To use it you will have to install it via `npm`:

```bash
npm install @hint/configuration-development
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

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
        "progressive-web-apps"
    ],
    "formatters": [
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

[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
