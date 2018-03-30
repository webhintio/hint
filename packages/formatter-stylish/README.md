# Formatter stylish (`@sonarwhal/formatter-stylish`)

The `stylish` formatter prints the results in table format indicating the
resource, line, and column:

![Example output for the stylish formatter](images/stylish-output.png)

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/formatter-stylish
```

Note: You can make `npm` install it as a `devDependency` using the `--save-dev`
parameter, or to install it globally, you can use the `-g` parameter. For
other options see
[`npm`'s documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.sonarwhalrc`][sonarwhalrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": "stylish",
    "rules": {
        ...
    },
    ...
}
```

<!-- Link labels: -->

[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
