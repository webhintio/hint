# Parser typescript-config (`@sonarwhal/parser-typescript-config`)

The `typescript-config` parser allows the user to analyze the
TypeScript configuration in their projects.

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/parser-typescript-config
```

And then activate it via the `.sonarwhalrc` configuration file:

```json
{
    "parsers": ["typescript-config"]
}
```

## Events emitted

This `parser` emits the following events:

* `parse::typescript-config`, of type `TypeScriptConfigParse`
  which contains the following information:

  * `resource`: the parsed resource.
  * `config`: an object with the configuration.

* `invalid-json::typescript-config`, of type `TypeScriptConfigInvalid`
  wich contains the folloing information:

  * `resource`: the parsed resource.
  * `error`: the error emited parsing the configuration file.

* `notfound::typescript-config`. This event is sent if the parser doesn't
  find any configuration file at the end of the scan.
  This event doesn't containt anything else.

## Types

If you need to import any type or enum defined in this parser, you just need to
import them as follow:

```ts
import { TypeOrEnumYouWantToUse } from '@sonarwhal/parser-typescript-config/dist/src/types';
```
