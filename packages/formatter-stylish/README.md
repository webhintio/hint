# Stylish (`@hint/formatter-stylish`)

The `stylish` formatter prints the results in table format indicating
the resource, line, and column:

![Example output for the stylish formatter](images/stylish-output.png)

This package is installed automatically by webhint:

```bash
npm install hint --save-dev
```

To use it, activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": ["stylish"],
    "hints": {
        ...
    },
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
