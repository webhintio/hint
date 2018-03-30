# babel-config (`@sonarwhal/rule-babel-config`)

`babel-config` contains rules to check if your Babel configuration has
the most recommended configuration.

## Why is this important?

Babel needs to be properly configured to reflect user's preference.

## How to use this rule?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-babel-config
```

You can make `npm` install it as a `devDependency` using the `--save-dev`
parameter, or to install it globally, you can use the `-g` parameter. For
other options see the
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

## Rule: `is-valid` (`babel-config/is-valid`)

### What does the rule check?

This rule checks if the Babel configuration specified in `.babelrc` or
the `babel` property in `package.json` adheres to the requirement of
the [babel configuration schema][babel config schema].

### Examples that **trigger** the rule

```json
{
    "plugins": [
        "example"
    ],
    "moduleId": 1, // This should be a string.
    "ignore": [
        "foo.js",
        "bar/**/*.js"
    ]
}
```

### Examples that **pass** the rule

```json
{
    "plugins": [
        "example"
    ],
    "moduleId": "id",
    "ignore": [
        "foo.js",
        "bar/**/*.js"
    ]
}

```

## Further Reading

* [Babel Documentation][babel documentation]

[babel config schema]: http://json.schemastore.org/babelrc
[babel documentation]: https://babeljs.io/docs/usage/babelrc/
