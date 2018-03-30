# Formatter codeframe (`@sonarwhal/formatter-codeframe`)

The `codeframe` formatter shows the results in table format indicating the
resource, line and column as well as the part of the code where the error
was found (if applicable):

![Example output for the codeframe formatter](images/codeframe-output.png)

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/formatter-codeframe
```

If you want to install it globally, add the parameter `-g`.
If you want to install it as a dev dependency, add the parameter `--save-dev`

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
