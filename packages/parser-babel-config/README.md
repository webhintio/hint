# Parser babel-config (`@sonarwhal/parser-babel-config`)

The `babel-config` parser allows the user to analyze the
Babel configuration in their projects.

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/parser-babel-config
```

If you want to install it globally, add the parameter `-g`.
If you want to install it as a dev dependency, add the parameter `--save-dev`

And then activate it via the [`.sonarwhalrc`][sonarwhalrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": ["babel-config"],
    "rules": {
        ...
    },
    ...
}
```

This parser detects if a `.babelrc` configuration file is present, or if the
Babel configuration is specified in `package.json`, and validates the Babel
configuration against the schema.

## Events emitted

This `parser` emits the following events:

* `parse::babel-config`, of type `BabelConfigParse`
  which contains the following information:

  * `resource`: the parsed resource.
  * `config`: an object with a valid configuration.

* `invalid-json::babel-config`, of type `BabelConfigInvalid`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `invalid-schema::babel-config`, of type `BabelConfigInvalidSchema`
  which contains the following information:

  * `resource`: the parsed resource.
  * `errors`: all the errors that the schama validator returns.

* `notfound::babel-config`. This event is sent if the parser doesn't
  find any configuration file at the end of the scan.
  This event doesn't containt anything else.

## Types

If you need to import any type or enum defined in this parser, you just need to
import them as follows:

```ts
import { TypeOrEnumYouWantToUse } from '@sonarwhal/parser-babel-config/dist/src/types';
```

<!-- Link labels: -->

[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
