# Formatter codeframe (`@sonarwhal/formatter-codeframe`)

The `codeframe` formatter shows the results in table format indicating the
resource, line and column as well as the part of the code where the error
was found (if applicable):

![Example output for the codeframe formatter](images/codeframe-output.png)

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/formatter-codeframe
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
    "formatters": "codeframe",
    "rules": {
        ...
    },
    ...
}
```

<!-- Link labels: -->

[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
