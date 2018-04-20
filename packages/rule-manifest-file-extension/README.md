# Disallow non-standard file extension for the web app manifest file (`@sonarwhal/rule-manifest-file-extension`)

`manifest-file-extension` warns against using non-standard file
extensions for the [web app manifest][spec] file.

## Why is this important?

While the [`.webmanifest`][file extension] file extension is not
enforced by the specification, nor is it required by browsers, using
it makes it:

* [easier to set custom server configurations][server configs] for
  the web app manifest file
* possible to benefit from [existing configurations][other configs]

## How to use this rule?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-manifest-file-extension
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
    "parsers": [...],
    "rules": {
        "manifest-file-extension": "error"
    },
    ...
}
```

## What does the rule check?

The rule checks if the recommended [`.webmanifest`][file extension]
file extension is used for the web app manifest file.

### Examples that **trigger** the rule

```html
<link rel="manifest" href="site.json">
```

```html
<link rel="manifest" href="site.manifest">
```

### Examples that **pass** the rule

```html
<link rel="manifest" href="site.webmanifest">
```

## Further Reading

* [Web App Manifest Specification][spec]

<!-- Link labels: -->

[file extension]: https://w3c.github.io/manifest/#media-type-registration
[other configs]: https://github.com/jshttp/mime-db/blob/67a4d013c31e73c47b5d975062f0088aea6cd5cd/src/custom-types.json#L85-L92
[server configs]: https://github.com/w3c/manifest/issues/346
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
[spec]: https://www.w3.org/TR/appmanifest
