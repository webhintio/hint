# webpack config parser (`@hint/parser-webpack-config`)

The `webpack-config` parser allows the user to analyze the webpack
configuration in their projects.

To use it you will have to install it via `npm`:

```bash
npm install @hint/parser-webpack-config
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc] configuration file:

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

This parser detect if a webpack configuration file is present in your
project, checking the name of the file (`webpack.config.json`).

## Events emitted

This `parser` emits the following events:

* `parse::webpack-config::end`, of type `WebpackConfigParse`
  which contains the following information:

  * `resource`: the parsed resource.
  * `config`: an object with a valid configuration (`webpack.Configuration`).
  * `version`: the webpack version installed locally.

* `parse::webpack-config::error::configuration`, of type `WebpackConfigInvalidConfiguration`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::webpack-config::error::not-install`. This event is sent if
  the package `webpack` is not installed locally. This event doesn't
  containt anything else.

* `parse::webpack-config::error::not-found`. This event is sent if
  the parser doesn't find any configuration file at the end of the
  scan. This event doesn't containt anything else.

## Types

If you need to import any type defined in this parser, you need to
import them as follows:

```ts
import { TypeYouWantToUse } from '@hint/parser-webpack-config/dist/src/types';
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
