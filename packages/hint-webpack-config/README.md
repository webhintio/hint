# webpack configuration hints set (`webpack-config`)

`webpack-config` contains set of hints to check if your webpack
configuration file (`webpack.config.js`) has the most recommended
configuration.

## Why is this important?

If you are building an app or a website using webpack, you need to
be sure that your configuration is the best for your needs.

## Hints

* [webpack-config/config-exists][config-exists]
* [webpack-config/is-installed][is-installed]
* [webpack-config/is-valid][is-valid]
* [webpack-config/module-esnext-typescript][module-esnext-typescript]
* [webpack-config/modules-false-babel][modules-false-babel]
* [webpack-config/no-devtool-in-prod][no-devtool-in-prod]

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
        "webpack-config/config-exists": "error",
        "webpack-config/is-installed": "error",
        "webpack-config/is-valid": "error",
        "webpack-config/module-esnext-typescript": "error",
        "webpack-config/no-devtool-in-prod": "error",
        ...
    },
    "parsers": ["webpack-config", "typescript-config"],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [webpack Documentation][webpack docs]

<!-- Link labels: -->

[config-exists]: https://github.com/webhintio/hint/blob/HEAD/packages/hint-webpack-config/docs/config-exists.md
[is-installed]: https://github.com/webhintio/hint/blob/HEAD/packages/hint-webpack-config/docs/is-installed.md
[is-valid]: https://github.com/webhintio/hint/blob/HEAD/packages/hint-webpack-config/docs/is-valid.md
[module-esnext-typescript]: https://github.com/webhintio/hint/blob/HEAD/packages/hint-webpack-config/docs/module-esnext-typescript.md
[modules-false-babel]: https://github.com/webhintio/hint/blob/HEAD/packages/hint-webpack-config/docs/modules-false-babel.md
[no-devtool-in-prod]: https://github.com/webhintio/hint/blob/HEAD/packages/hint-webpack-config/docs/no-devtool-in-prod.md
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[webpack docs]: https://webpack.js.org/concepts/
