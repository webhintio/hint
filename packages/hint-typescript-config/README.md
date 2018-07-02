# TypeScript configuration hints set (`typescript-config`)

`typescript-config` contains hints to check if your TypeScript configuration
has the most recommended configuration.

## Why is this important?

If you are building an app or a website using TypeScript, you
need to be sure that your configuration is the best for your needs.

## Hints

* [typescript-config/import-helpers][import-helpers]
* [typescript-config/is-valid][is-valid]
* [typescript-config/no-comment][no-comment]
* [typescript-config/strict][strict]
* [typescript-config/target][target]

## How to use these hints?

To use it you will have to install it via `npm`:

```bash
npm install typescript-config
```

Note: You can make `npm` install it as a `devDependency` using the `--save-dev`
parameter, or to install it globally, you can use the `-g` parameter. For
other options see
[`npm`'s documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": [...],
    "hints": {
        "typescript-config/is-valid": "error",
        "typescript-config/no-comment": "error",
        "typescript-config/target": "error"
    },
    ...
}
```

## Further Reading

* [TypeScript Documentation][typescript docs]

<!-- Link labels: -->

[import-helpers]: ./docs/import-helpers.md
[is-valid]: ./docs/is-valid.md
[no-comment]: ./docs/no-comment.md
[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
[strict]: ./docs/strict.md
[target]: ./docs/target.md
[typescript docs]: https://www.typescriptlang.org/docs/home.html
