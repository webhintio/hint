# package.json config (`@hint/parser-package-json`)

The `package-json` parser allows the user to analyze the package-json
configuration in their projects.

To use it you will have to install it via `npm`:

```bash
npm install @hint/parser-package-json
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [the `npm`
documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc] configuration file:

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

This parser detects if a `package.json` file is present in the project and
validates its configuration against the the `package.json` schema.

## Events emitted

This `parser` emits the following events:

* `parse::start::package-json`, of type `PackageJsonParseStart`
  which contains the following information:

  * `resource`: the resource we are going to parse.

* `parse::end::package-json`, of type `PackageJsonParsed`
  which contains the following information:

  * `resource`: the parsed resource.
  * `config`: an object with a valid configuration.

* `parse::error::package-json::json`, of type `PackageJsonInvalidJSON`
  which contains the following information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the package.json.

* `parse::error::package-json::schema`, of type `PackageJsonInvalidSchema`
  which contains the following information:

  * `resource`: the parsed resource.
  * `errors`: all the errors that the schama validator returns.

## Types

If you need to import any type or enum defined in this parser,
you need to import them as follows:

```ts
import { TypeOrEnumYouWantToUse } from '@hint/parser-package-json';
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
