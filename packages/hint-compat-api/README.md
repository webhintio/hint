# Compatibility of CSS, HTML and JavaScript features (`compat-api`)

`compat api` contains hints to check if your CSS, HTML, and JavaScript
have deprecated or not broadly supported features.

## Why is this important?

You need to know if all the properties that you are using in your files
are compatible with the target browsers that you want to support.

## Hints

* [compat-api/css][compat-api-css]
* [compat-api/html][compat-api-html]

## How to use these hints?

This package is installed automatically by webhint:

```bash
npm install hint --save-dev
```

To use it, activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "compat-api/css": "error",
        "compat-api/html": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

<!-- Link labels: -->

[compat-api-css]: https://github.com/webhintio/hint/blob/HEAD/packages/hint-compat-api/docs/css.md
[compat-api-html]: https://github.com/webhintio/hint/blob/HEAD/packages/hint-compat-api/docs/html.md
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[npm docs]: https://docs.npmjs.com/cli/install
