# Formatter excel (`@sonarwhal/formatter-excel`)

The `excel` formatter outputs the results in an Excel file (xlsx), each
resource in its sheet:

![Example output for the summary sheet of the excel formatter](images/summary.png)

![Example output for one of the details sheet of the excel formatter](images/details.png)

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/formatter-excel
```

If you want to install it globally, add the parameter `-g`.
If you want to install it as a dev dependency, add the parameter `--save-dev`

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
