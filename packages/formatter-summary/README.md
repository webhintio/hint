# Formatter summary (`@sonarwhal/formatter-summary`)

The `summary` formatter prints the results of a site analysis in a table with
how many errors or warnings a rule has found:

![Example output for the summary formatter](images/summary-output.png)

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/formatter-summary
```

If you want to install it globally, add the parameter `-g`.
If you want to install it as a dev dependency, add the parameter `--save-dev`

And then activate it via the [`.sonarwhalrc`][sonarwhalrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": "summary",
    "rules": {
        ...
    },
    ...
}
```

<!-- Link labels: -->

[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
