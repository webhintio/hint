# Formatter excel (`@sonarwhal/formatter-excel`)

The `excel` formatter outputs the results in an Excel file (xlsx), each
resource in its sheet:

![Example output for the summary sheet of the excel formatter](images/summary.png)

![Example output for one of the details sheet of the excel formatter](images/details.png)

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/formatter-excel
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
    "formatters": "excel",
    "rules": {
        ...
    },
    ...
}
```

<!-- Link labels: -->

[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
