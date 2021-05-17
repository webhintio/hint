# Manifest (`@hint/parser-manifest`)

The `manifest` parser detects if a [web app manifest file][manifest] was
specified, and if so, it will try to fetch it, parse and check if its
content is valid.

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
    "parsers": ["manifest"],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Events emitted

The following events are emitted by the `parser`:

### `fetch::start::manifest`

Event is of type [`FetchStart`][fetchstart] and is emitted when the
parser starts downloading the web app manifest file.

### `fetch::end::manifest`

Event is of type [`FetchEnd`][fetchend] and is emitted when the parser
successfully downloaded the web app manifest file.

### `fetch::error::manifest`

Event is of type [`FetchError`][fetcherror] and is emitted when the
parser encounters a problem trying to fetch the web app manifest file.

### `parse::end::manifest`

Event is emitted when the parser successfully completed parsing
the web app manifest file.

**Format:**

```ts
export type ManifestParsed = FetchEnd & {
    /** The content of manifest parsed */
    parsedContent: Manifest;
};
```

### `parse::error::manifest::json`

Event is emitted when the content of the web app manifest file
is not valid JSON.

**Format:**

```ts
export type ManifestInvalidJSON = ErrorEvent & {
    /** The parse JSON error. */
    error: Error;
};
```

### `parse::error::manifest::schema`

Event is emitted when the content of the web app manifest file
is not valid according to the schema.

**Format:**

```ts
export type ManifestInvalidSchema = ErrorEvent & {
    /** The parse errors as returned by ajv. */
    errors: ajv.ErrorObject[];
    /** The errors in a more human readable format. */
    prettifiedErrors: string[];
};
```

## Types

If you need to import any type or enum defined in this parser, you just
need to import them as follows:

```ts
import { TypeOrEnumYouWantToUse } from '@hint/parser-manifest';
```

<!-- Link labels: -->

[fetchend]: https://webhint.io/docs/contributor-guide/getting-started/events/#fetchend
[fetcherror]: https://webhint.io/docs/contributor-guide/getting-started/events/#fetcherror
[fetchstart]: https://webhint.io/docs/contributor-guide/getting-started/events/#fetchstart
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[manifest]: https://www.w3.org/TR/appmanifest/
