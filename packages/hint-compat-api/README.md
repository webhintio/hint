# Compatibility of CSS, HTML and JavaScript features (`compat-api`)

`compat api` contains hints to check if your CSS, HTML, and JavaScript
have deprecated or not broadly supported features.

## Why is this important?

You need to know if all the properties that you are using in your files
are compatible with the target browsers that you want to support.

## Hints

* [compat-api/css][compat-api-css]
* [compat-api/css-next][compat-api-css-next]
* [compat-api/html][compat-api-html]
* [compat-api/html-next][compat-api-html-next]

## How to use these hints?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-compat-api
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s documentation][npm docs].

And then activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "compat-api/css": "error",
        "compat-api/css-next": "error",
        "compat-api/html": "error",
        "compat-api/html-next": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

<!-- Link labels: -->

[compat-api-css]: ./docs/css.md
[compat-api-css-next]: ./docs/css-next.md
[compat-api-html]: ./docs/html.md
[compat-api-html-next]: ./docs/html-next.md
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[npm docs]: https://docs.npmjs.com/cli/install
