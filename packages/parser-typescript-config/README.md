# TypeScript config (`@hint/parser-typescript-config`)

The `typescript-config` parser allows the user to analyze the
TypeScript configuration in their projects.

It will detect if a TypeScript configuration file is present in
your project, checking the name of the file (i.e. `tsconfig.json`,
`tsconfig.developement.json`). This parser detects if a config file
has a valid content.

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
    "parsers": ["typescript-config"],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Events emitted

This `parser` emits the following events:

* `parse::start::typescript-config`, of type `TypeScriptConfigParseStart`
  which contains the following information:

  * `resource`: the resource we are going to parse.

* `parse::end::typescript-config`, of type `TypeScriptConfigParse`
  which contains the following information:

  * `resource`: the parsed resource.
  * `getLocation`: helper to find the location of a path within the original
    JSON source.
  * `config`: the final configuration after adding default values
    (`TypeScriptConfig`).
  * `mergedConfig`: the merged configuration after inlining `extends`.
  * `originalConfig`: the original configuration before resolving `extends`.

* `parse::error::typescript-config::json`, of type `TypeScriptConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::error::typescript-config::cicular`, of type `TypeScriptConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::error::typescript-config::extends`, of type `TypeScriptConfigInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `parse::error::typescript-config::schema`, of type
  `TypeScriptConfigInvalidSchema` which contains the following information:

  * `resource`: the parsed resource.
  * `errors`: all the errors that the schama validator returns.

## Types

If you need to import any type or enum defined in this parser, you
need to import them as follows:

```ts
import { TypeOrEnumYouWantToUse } from '@hint/parser-typescript-config';
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
