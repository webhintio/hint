# Correct manifest extension (`manifest-file-extension`)

`manifest-file-extension` warns against using non-standard file
extensions for the [web app manifest][spec] file.

## Why is this important?

While the [`.webmanifest`][file extension] file extension is not
enforced by the specification, nor is it required by browsers, using
it makes it:

* [easier to set custom server configurations][server configs] for
  the web app manifest file
* possible to benefit from [existing configurations][other configs]

## What does the hint check?

The hint checks if the recommended [`.webmanifest`][file extension]
file extension is used for the web app manifest file.

### Examples that **trigger** the hint

```html
<link rel="manifest" href="site.json">
```

```html
<link rel="manifest" href="site.manifest">
```

### Examples that **pass** the hint

```html
<link rel="manifest" href="site.webmanifest">
```

## How to use this hint?

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
        "manifest-file-extension": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [Web App Manifest Specification][spec]

<!-- Link labels: -->

[file extension]: https://w3c.github.io/manifest/#media-type-registration
[other configs]: https://github.com/jshttp/mime-db/blob/67a4d013c31e73c47b5d975062f0088aea6cd5cd/src/custom-types.json#L85-L92
[server configs]: https://github.com/w3c/manifest/issues/346
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[spec]: https://www.w3.org/TR/appmanifest
