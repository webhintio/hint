# Babel configuration hint set (`babel-config`)

`babel-config` contains hints to check if your Babel configuration
has the most recommended configuration.

## Why is this important?

Babel needs to be properly configured to reflect user's preference.

## Hints

* [babel-config/is-valid][is-valid]

## How to use this hint?

This package is installed automatically by webhint:

```bash
npm install hint --save-dev
```

To use it, activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "babel-config/is-valid": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [Babel Documentation][babel documentation]

<!-- Link labels: -->

[babel documentation]: https://babeljs.io/docs/usage/babelrc/
[is-valid]: https://github.com/webhintio/hint/blob/HEAD/packages/hint-babel-config/docs/is-valid.md
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
