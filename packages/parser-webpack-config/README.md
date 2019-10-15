# webpack config (`@hint/parser-webpack-config`)

The `webpack-config` parser allows the user to analyze the webpack
configuration in their projects.

It will detect if a webpack configuration file is present in your
project, checking the name of the file (`webpack.config.json`).

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
        ...
    },
    "parsers": ["webpack-config"],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Events emitted

This `parser` emits the following events:

* `parse::end::webpack-config`, of type `WebpackConfigParse`
  which contains the following information:

  * `resource`: the parsed resource.
  * `config`: an object with a valid configuration (`webpack.Configuration`).
  * `version`: the webpack version installed locally.

* `parse::error::webpack-config::configuration`, of type `WebpackConfigInvalidConfiguration`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::error::webpack-config::not-install`. This event is sent if
  the package `webpack` is not installed locally. This event doesn't
  containt anything else.

* `parse::error::webpack-config::not-found`. This event is sent if
  the parser doesn't find any configuration file at the end of the
  scan. This event doesn't containt anything else.

## Types

If you need to import any type defined in this parser, you need to
import them as follows:

```ts
import { TypeYouWantToUse } from '@hint/parser-webpack-config';
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
