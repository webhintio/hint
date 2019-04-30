# Manifest has icons (`manifest-icons`)

`manifest-icons` requires that the icons specified in the Web App Manifest file
have a `192x192` and `512x512` size icon
with valid type either `png` or `jpg`.

## Why is this important?

Icons are important for the user of your web app.

When a user adds your site to their home screen, you can define
a set of icons for the browser to use. These icons are used in
places like the home screen, app launcher, task switcher, splash screen, etc.

From Google's [Web App Manifest Guide][google-guide],
`icons` is an array of image objects. Each object should include the `src`,
a `sizes` property, and the `type` of image.

## What does the hint check?

`manifest-icons` checks that:

1. The icons file actually exists.
2. The icons `type` is specified and matches the real icon type.
3. Icon type is either `png` or `jpg`.
4. The `sizes` is specified and matches the real icon size.
5. Icons of required sizes: `192x192` and `512x512` are specified.

### Examples that **trigger** the hint

A list of code examples that will fail this hint.

#### Example 1

Valid `icons` property was not found in the web app manifest

```json
{
    ...,
    "icons": [],
    ...
}
```

#### Example 2

Icon could not be fetched (status code: 404).

`http://localhost:5000/an-inaccessible-path.png`

```json
{
    ...,
    "icons": [
        {
            "src": "an-inaccessible-path.png",
            "sizes": "152x152",
            "type": "image/png"
        },
        {
            "src": "images/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "images/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    ...
}
```

#### Example 3

hint #1: Real image type (`png`) do not match with
specified type (`madeuptype`)

`http://localhost:5000/images/icons/icon-128x128.png`

hint #2: Real image size (`144x144`) do not match with
specified size (`144,17`)

`http://localhost:5000/images/icons/icon-144x144.png`

```json
{
    ...,
    "icons": [
        {
            "src": "images/icons/icon-128x128.png",
            "sizes": "128x128",
            "type": "image/madeuptype"
        },
        {
            "src": "images/icons/icon-144x144.png",
            "sizes": "144x17",
            "type": "image/png"
        },
        {
            "src": "images/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "images/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    ...
}
```

#### Example 4

hint #1: Required sizes `["512x512"]` not found.

`http://localhost:5000/manifest.json`

```json
{
    ...,
    "icons": [
        {
            "src": "images/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        }
    ],
    ...
}
```

### Examples that **pass** the hint

A list of code examples that will pass this hint.

#### Correct Usage Example 1

Minimal icons required are of `192x192` and `512x512`.

```json
{
    ...,
    "icons": [
        {
            "src": "images/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "images/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    ...
}
```

#### Correct Usage Example 2

More sizes can also be added apart from the required ones.

```json
{
    ...,
    "icons": [
        {
            "src": "images/icons/icon-128x128.png",
            "sizes": "128x128",
            "type": "image/png"
        },
        {
            "src": "images/icons/icon-144x144.png",
            "sizes": "144x144",
            "type": "image/png"
        },
        {
            "src": "images/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "images/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    ...
}
```

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-manifest-icons
```

Note: You can make `npm` install it as a `devDependency` using the `--save-dev`
parameter, or to install it globally, you can use the `-g` parameter. For
other options see
[`npm`'s documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": [...],
    "hints": {
        "manifest-icons": "error"
    },
    ...
}
```

## Further Reading

See [W3C Web App Manifest Spec.][w3c-icon-spec] for icons to get more information.
<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[google-guide]: https://developers.google.com/web/fundamentals/web-app-manifest/#icons
[w3c-icon-spec]: https://www.w3.org/TR/appmanifest/#imageresource-and-its-members
