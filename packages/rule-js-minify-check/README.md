# js-minify-check (`@sonarwhal/rule-js-minify-check`)

Description for js-minify-check

## Why is this important?

Explain why this rule is important for your users

## How to use this rule?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-js-minify-check
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
        "js-minify-check": "error"
    },
    ...
}
```

## What does the rule check?

A bit more detail of what the rule does.

### Examples that **trigger** the rule

A list of code examples that will fail this rule.
It's good to put some edge cases in here.

### Examples that **pass** the rule

A list of code examples that will pass this rule.
It's good to put some edge cases in here.

## Can the rule be configured?

If this rule allows some configuration, please put the format and
options for the user.

## Further Reading

What can the user read to know more about this subject?

<!-- Link labels: -->

[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
