# webhint's recommended progressive web apps configuration (`@hint/configuration-progressive-web-apps`)

This packages is a `webhint`'s configuration package to use for
checking progressive web apps (PWAs).

This package will automatically install all the missing dependencies.

To use it you will have to install it via `npm`:

```bash
npm install @hint/configuration-progressive-web-apps
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

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
        "name": "jsdom",
        "options": {
            "waitFor": 5000
        }
    },
    "formatters": [
        "summary"
    ],
    "hints": {
        "apple-touch-icons": "error",
        "manifest-app-name": "error",
        "manifest-exists": "error",
        "manifest-file-extension": "error",
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

[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
