# Formatter stylish (`@sonarwhal/formatter-stylish`)

The `stylish` formatter prints the results in table format indicating the
resource, line, and column:

![Example output for the stylish formatter](images/stylish-output.png)

To use it you need to configure your `.sonarwhalrc` file as follows:

```json
{
    "connector": { ... },
    "formatters": "stylish",
    "rules": {
        ...
    }
}
```
