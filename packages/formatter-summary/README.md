# Summary formatter (`@hint/formatter-summary`)

The `summary` formatter prints the results of a site analysis in
a table with how many errors or warnings a hint has found:

![Example output for the summary formatter](images/summary-output.png)

To use it you will have to install it via `npm`:

```bash
npm install @hint/formatter-summary
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": "summary",
    "hints": {
        ...
    },
    ...
}
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
