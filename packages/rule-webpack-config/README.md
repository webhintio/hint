# webpack configuration rules set (`@sonarwhal/rule-webpack-config`)

`webpack-config` contains set of rules to check if your webpack configuration
file (`webpack.config.js`) has the most recommended configuration.

## Why is this important?

If you are building an app or a website using webpack, you
need to be sure that your configuration is the best for your needs.

## Rules

* [webpack-config/config-exists][config-exists]
* [webpack-config/is-installed][is-installed]
* [webpack-config/is-valid][is-valid]
* [webpack-config/module-esnext-typescript][module-esnext-typescript]
* [webpack-config/modules-false-babel][modules-false-babel]
* [webpack-config/no-devtool-in-prod][no-devtool-in-prod]

## How to use these rules?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-webpack-config
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
    "parsers": ["webpack-config", "typescript-config"],
    "rules": {
        "webpack-config/config-exists": "error",
        "webpack-config/is-installed": "error",
        "webpack-config/is-valid": "error",
        "webpack-config/module-esnext-typescript": "error",
        "webpack-config/no-devtool-in-prod": "error",
        ...
    },
    ...
}
```

## Further Reading

* [webpack Documentation][webpack docs]

<!-- Link labels: -->

[config-exists]: ./docs/config-exists.md
[is-installed]: ./docs/is-installed.md
[is-valid]: ./docs/is-valid.md
[module-esnext-typescript]: ./docs/module-esnext-typescript.md
[modules-false-babel]: ./docs/modules-false-babel.md
[no-devtool-in-prod]: ./docs/no-devtool-in-prod.md
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
[webpack docs]: https://webpack.js.org/concepts/