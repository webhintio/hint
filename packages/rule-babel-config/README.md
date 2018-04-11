# babel-config (`@sonarwhal/rule-babel-config`)

`babel-config` contains rules to check if your Babel configuration has
the most recommended configuration.

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-babel-config
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
    "formatters": [...],
    "parsers": [...],
    "rules": {
        "babel-config/is-valid": "error"
    },
    ...
}
```

## Why is this important?

Babel needs to be properly configured to reflect user's preference.

## Rules

* [babel-config/is-valid][is-valid]

## Further Reading

* [Babel Documentation][babel documentation]

[is-valid]: ./docs/is-valid.md
[babel documentation]: https://babeljs.io/docs/usage/babelrc/