# Babel config parser (`@hint/parser-babel-config`)

The `babel-config` parser allows the user to analyze the Babel
configuration in their projects.

To use it you will have to install it via `npm`:

```bash
npm install @hint/parser-babel-config
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
    "parsers": ["babel-config"],
    ...
}
```

This parser detects if a `.babelrc` configuration file is present,
or if the Babel configuration is specified in `package.json`, and
validates the Babel configuration against the schema.

## Events emitted

This `parser` emits the following events:

* `parse::babel-config::start`, of type `BabelConfigParseStart`
  which contains the following information:

  * `resource`: the resource we are going to parse.

* `parse::babel-config::end`, of type `BabelConfigParse`
  which contains the following information:

  * `resource`: the parsed resource.
  * `config`: an object with a valid configuration.

* `parse::babel-config::error::json`, of type `BabelConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::babel-config::error::circular`, of type `BabelConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::babel-config::error::extends`, of type `BabelConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::babel-config::error::schema`, of type `BabelConfigInvalidSchema`
  which contains the following information:

  * `resource`: the parsed resource.
  * `errors`: all the errors that the schama validator returns.

## Types

If you need to import any type or enum defined in this parser,
you need to import them as follows:

```ts
import { TypeOrEnumYouWantToUse } from '@hint/parser-babel-config/dist/src/types';
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
