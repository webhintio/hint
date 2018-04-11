# `is-valid`

## Why is this important?

If you are building an app or a website using babel, you
need to be sure the configuration file is valid.

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