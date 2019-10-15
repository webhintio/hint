# package.json config (`@hint/parser-package-json`)

This parser detects if a `package.json` file is present in the project and
validates its configuration against the `package.json` schema.

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
    "parsers": ["package-json"],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Events emitted

This `parser` emits the following events:

* `parse::start::package-json`, of type `PackageJsonParseStart`
  which contains the following information:

  * `resource`: the resource we are going to parse.

* `parse::end::package-json`, of type `PackageJsonParsed`
  which contains the following information:

  * `resource`: the parsed resource.
  * `config`: an object with a valid configuration.
  * `getLocation`: method yeilding the resource's problem location.

* `parse::error::package-json::json`, of type `PackageJsonInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the package.json.

* `parse::error::package-json::schema`, of type `PackageJsonInvalidSchema`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error message.
  * `errors`: all the errors that the schama validator returns.
  * `prettifiedErrors`: the errors formatted in a way that is easy to understand.

## Types

If you need to import any type or enum defined in this parser,
you need to import them as follows:

```ts
import { TypeOrEnumYouWantToUse } from '@hint/parser-package-json';
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
