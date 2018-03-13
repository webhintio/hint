# babel-config/is-valid (`@sonarwhal/rule-babel-config`)

Validate the Babel configuration specified in `.babelrc` or the `babel`
property in `package.json` against the
[babel configuration schema][babel config schema].

## Why is this important?

Babel needs to be properly configured to reflect user's preference.

## What does the rule check?

This rule checks if the Babel configuration specified in `.bablerc` or
the `babel` property in `package.json` adheres to the requirement of
the schema.

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
