# Excel (`@hint/formatter-excel`)

The `excel` formatter outputs the results in an Excel file (`xlsx`),
each resource in its sheet:

![Example output for the summary sheet of the excel
formatter](images/summary.png)

![Example output for one of the details sheet of the excel
formatter](images/details.png)

The file will be created in the folder where `webhint` is called from
(i.e.: `process.cwd()`).

To use it you will have to install it via `npm`:

```bash
npm install @hint/formatter-excel --save-dev
```

**Note:** The recommended way of running webhint is as a `devDependency` of
your project.

And then activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": ["excel"],
    "hints": {
        ...
    },
    ...
}
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
