# compat-api (`@hint/hint-compat-api`)

description

## Why is this important?

Explain why this package is important for your users

## Hints

* [compat-api/compat-api-css][compat-api-css]

## How to use these hints?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-compat-api
```

Note: You can make `npm` install it as a `devDependency` using the `--save-dev`
parameter, or to install it globally, you can use the `-g` parameter. For
other options see
[`npm`'s documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": [...],
    "hints": {
        "compat-api/compat-api-css": "error",
        "compat-api/compat-api-js": "error"
    },
    ...
}
```

## Further Reading

What can the user read to know more about this subject?

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
[compat-api-css]: ./docs/compat-api-css.md
