# HTML formatter (`@hint/formatter-html`)

The `html` formatter outputs the result in a HTML file.

![Example output for the html formatter](images/html-output.png)

To use it you will have to install it via `npm`:

```bash
npm install @hint/formatter-html
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": "html",
    "hints": {
        ...
    },
    ...
}
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
