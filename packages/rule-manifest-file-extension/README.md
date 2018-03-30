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

If you want to install it globally, add the parameter `-g`.
If you want to install it as a dev dependency, add the parameter `--save-dev`

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
[spec]: https://www.w3.org/TR/appmanifest
