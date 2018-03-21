# Formatter stylish (`@sonarwhal/formatter-stylish`)

The `stylish` formatter prints the results in table format indicating the
resource, line, and column:

![Example output for the stylish formatter](images/stylish-output.png)

To use it you need to configure your [`.sonarwhalrc`][sonarwhalrc] file
as follows:

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
