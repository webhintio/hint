# Formatter json (`@sonarwhal/formatter-json`)

The `json` does a `JSON.stringify()` of the results. Output is not very user
friendly, but it can be useful when using it as input for other tools:

![Example output for the json formatter](images/json-output.png)

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/formatter-json
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
    "formatters": "json",
    "rules": {
        ...
    },
    ...
}
```

<!-- Link labels: -->

[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
