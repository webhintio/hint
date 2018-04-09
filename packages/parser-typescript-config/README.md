# Parser typescript-config (`@sonarwhal/parser-typescript-config`)

The `typescript-config` parser allows the user to analyze the
TypeScript configuration in their projects.

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/parser-typescript-config
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
    "parsers": ["typescript-config"],
    "rules": {
        ...
    },
    ...
}
```

This parser detect if a TypeScript configuration file is present in your
project, checking the name of the file (i.e. `tsconfig.json`,
`tsconfig.developement.json`). This parser detects if a config file has a
valid content.

## Events emitted

This `parser` emits the following events:

* `parse::typescript-config::end`, of type `TypeScriptConfigParse`
  which contains the following information:

  * `resource`: the parsed resource.
  * `config`: an object with a valid configuration (`TypeScriptConfig`).

* `parse::typescript-config::error::json`, of type `TypeScriptConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::typescript-config::error::cicular`, of type `TypeScriptConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::typescript-config::error::extends`, of type `TypeScriptConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::typescript-config::error::schema`, of type
  `TypeScriptConfigInvalidSchema` which contains the following information:

  * `resource`: the parsed resource.
  * `errors`: all the errors that the schama validator returns.

* `parse::typescript-config::error::not-found`. This event is sent if the
  parser doesn't find any configuration file at the end of the scan.
  This event doesn't containt anything else.

## Types

If you need to import any type or enum defined in this parser, you
need to import them as follows:

```ts
import { TypeOrEnumYouWantToUse } from '@sonarwhal/parser-typescript-config/dist/src/types';
```

<!-- Link labels: -->

[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
