# typescript-config (`@sonarwhal/rule-typescript-config`)

`typescript-config` contains rules to check if your TypeScript configuration
has the most recommended configuration.

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-typescript-config
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
        "typescript-config/is-valid": "error",
        "typescript-config/no-comment": "error",
        "typescript-config/target": "error"
    },
    ...
}
```

## Why is this important?

If you are building an app or a website using TypeScript, you
need to be sure that your configuration is the best for your needs.

## Rules

* [typescript-config/is-valid][is-valid]
* [typescript-config/no-comment][no-comment]
* [typescript-config/target][terget]

## Further Reading

* [TypeScript Documentation][typescript docs]

[is-valid]: ./docs/is-valid.md
[no-comment]: ./docs/no-comment.md
[target]: ./docs/target.md
[typescript docs]: https://www.typescriptlang.org/docs/home.html
