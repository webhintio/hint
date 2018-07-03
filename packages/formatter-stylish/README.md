# Formatter stylish (`@hint/formatter-stylish`)

The `stylish` formatter prints the results in table format indicating the
resource, line, and column:

![Example output for the stylish formatter](images/stylish-output.png)

To use it you will have to install it via `npm`:

```bash
npm install @hint/formatter-stylish
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
    "formatters": "stylish",
    "hints": {
        ...
    },
    ...
}
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
