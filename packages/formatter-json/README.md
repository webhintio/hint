# JSON (`@hint/formatter-json`)

The `json` formatter does a `JSON.stringify()` of the results. Output is not
very user friendly, but it can be useful when using it as input for
other tools:

![Example output for the json formatter](images/json-output.png)

To use it you will have to install it via `npm`:

```bash
npm install @hint/formatter-json --save-dev
```

**Note:** The recommended way of running webhint is as a `devDependency` of
your project.

And then activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": ["json"],
    "hints": {
        ...
    },
    ...
}
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
