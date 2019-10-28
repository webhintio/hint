# TypeScript configuration hints set (`typescript-config`)

`typescript-config` contains hints to check if your TypeScript
configuration has the most recommended configuration.

## Why is this important?

If you are building an app or a website using TypeScript, you
need to be sure that your configuration is the best for your needs.

## Hints

* [typescript-config/import-helpers][import-helpers]
* [typescript-config/is-valid][is-valid]
* [typescript-config/no-comments][no-comments]
* [typescript-config/strict][strict]
* [typescript-config/target][target]

## How to use these hints?

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
        "typescript-config/is-valid": "error",
        "typescript-config/no-comment": "error",
        "typescript-config/target": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [TypeScript Documentation][typescript docs]

<!-- Link labels: -->

[import-helpers]: ./docs/import-helpers.md
[is-valid]: ./docs/is-valid.md
[no-comments]: ./docs/no-comments.md
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[strict]: ./docs/strict.md
[target]: ./docs/target.md
[typescript docs]: https://www.typescriptlang.org/docs/home.html
