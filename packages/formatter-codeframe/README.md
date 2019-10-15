# Codeframe (`@hint/formatter-codeframe`)

The `codeframe` formatter shows the results in table format indicating
the resource, line and column as well as the part of the code where the
error was found (if applicable):

![Example output for the codeframe formatter](images/codeframe-output.png)

To use it you will have to install it via `npm`:

```bash
npm install @hint/formatter-codeframe --save-dev
```

**Note:** The recommended way of running webhint is as a `devDependency` of
your project.

And then activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": ["codeframe"],
    "hints": {
        ...
    },
    ...
}
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
