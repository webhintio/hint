# Formatter stylish (`@sonarwhal/formatter-stylish`)

The `stylish` formatter prints the results in table format indicating the
resource, line, and column:

![Example output for the stylish formatter](images/stylish-output.png)

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/formatter-stylish
```

If you want to install it globally, add the parameter `-g`.
If you want to install it as a dev dependency, add the parameter `--save-dev`

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
