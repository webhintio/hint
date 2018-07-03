# Manifest parser (`@hint/parser-manifest`)

`parser-manifest` detects if a [web app manifest file][manifest] was
specified, and if so, it will try to fetch it, parse and check if its
content is valid.

## How to install and use it

To use it you will have to install it via `npm`:

```bash
npm install @hint/parser-manifest
```

If you want to install it globally, add the parameter `-g`. If you want
to install it as a dev dependency, add the parameter `--save-dev`.

And then activate it via the [`.hintrc`][hintrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": ["manifest"],
    "hints": {
        ...
    },
    ...
}
```

## Events emitted

The following events are emitted by the `parser`:

### `fetch::start::manifest`

Event is of type [`FetchStart`](https://webhint.io/docs/contributor-guide/getting-started/events/#fetchstart)
and is emitted when the parser starts downloading the web app
manifest file.

### `fetch::end::manifest`

Event is of type [`FetchEnd`](https://webhint.io/docs/contributor-guide/getting-started/events/#fetchend)
and is emitted when the parser successfully downloaded the web app
manifest file.

### `fetch::error::manifest`

Event is of type [`FetchError`](https://webhint.io/docs/contributor-guide/getting-started/events/#fetcherror)
and is emitted when the parser encounters a problem trying to fetch
the web app manifest file.

### `parse::manifest::end`

Event is emitted when the parser successfully completed parsing
the web app manifest file.

**Format:**

```ts

export type ManifestParsed = FetchEnd & {
    /** The content of manifest parsed */
    parsedContent: Manifest;
};
```

### `parse::manifest::error::json`

Event is emitted when the content of the web app manifest file
is not valid JSON.

**Format:**

```ts
export type ManifestInvalidJSON = FetchEnd & {
    /** The parse JSON error. */
    error: Error;
};
```

### `parse::manifest::error::schema`

Event is emitted when the content of the web app manifest file
is not valid according to the schema.

**Format:**

```ts
export type ManifestInvalidSchema = FetchEnd & {
    /** The parse errors as returned by ajv. */
    errors: Array<ajv.ErrorObject>;
    /** The errors in a more human readable format. */
    prettifiedErrors: Array<string>;
};

```

## Types

If you need to import any type or enum defined in this parser, you just
need to import them as follows:

```ts
import { TypeOrEnumYouWantToUse } from '@hint/parser-manifest/dist/src/types';
```

<!-- Link labels: -->

[manifest]: https://www.w3.org/TR/appmanifest/
[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
