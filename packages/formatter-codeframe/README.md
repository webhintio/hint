# Formatter codeframe (`@sonarwhal/formatter-codeframe`)

The `codeframe` formatter shows the results in table format indicating the
resource, line and column as well as the part of the code where the error
was found (if applicable):

![Example output for the codeframe formatter](images/codeframe-output.png)

To use it you need to configure your [`.sonarwhalrc`][sonarwhalrc] file
as follows:

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
