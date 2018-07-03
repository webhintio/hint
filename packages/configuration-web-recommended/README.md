# webhint's recommended web configuration (`@hint/configuration-web-recommended`)

This packages is a `webhint`'s configuration package to use in
production websites.

This package will automatically install all the missing dependencies.

To use it you will have to install it via `npm`:

```bash
npm install @hint/configuration-web-recommended
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

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
        "name": "jsdom",
        "options": {
            "waitFor": 5000
        }
    },
    "formatters": [
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

[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
