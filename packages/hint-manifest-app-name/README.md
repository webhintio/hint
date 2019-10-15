# Manifest has name (`manifest-app-name`)

`manifest-app-name` checks if the name of the web application is
specified within the manifest file.

## Why is this important?

Browsers that support the [web app manifest file][manifest spec] will
use the value of the [`name`][manifest name] property (or
[`short_name`][manifest short_name]'s value, when there is insufficient
space) to display the name of the app in various places across the OS
such as the list of apps installed, an app icon label etc.

If these properties are not defined, browsers will try to get the name
from other sources such as the value of the [`application-name` meta tag,
`<title>`, or default to a specific value (e.g.: `Untitled`)][manifest
metadata]. This can lead to a bad user experience, as the app name may
be truncated or wrong.

So, to reduce the risk of having the app name truncated, it's
recommended to define the `name` property and keep its value under 30
characters, and if it’s over 12 characters, include a `short_name`
property that is at most 12 characters.

Notes:

* If the `name` property value is under or 12 characters, there is
  no need to provide the `short_name` property as browsers can use
  the value of `name`.

* The 12-character limit is used to ensure that for most cases the
  value won’t be truncated. However, depending on [other
  things][webhint issue], such as:

  * what font the user is using
  * what characters the web site/app name includes (e.g. `i` occupies
    less space than `W`)

  the text may still be truncated even if it’s under 12 characters.

* The above recommended limits are set to be consistent with the native
  OSes and/or store limits/recommendations, e.g.:

  * For [Windows][windows] and the [Microsoft Store (which now also
    includes progressive web apps)][microsoft store] the recommendation
    is to have the value of the `name` property be up to 256 characters
    while the value of the `short_name` property can be up to 40 characters.

  * [Android][android] and [iOS][ios] also recommend the application
    name be under 30 characters.

## What does the hint check?

The hint checks if a non-empty `name` member was specified and its
value is under 30 characters.

If the `name` member is over 12 characters, or `short_name` is
specified, the hint will also check if `short_name` has a non-empty
value that is under 12 characters.

### Examples that **trigger** the hint

Manifest is specified without `name` and `short_name`:

```json
{
    ...
}
```

Manifest is specified with a `name` longer than 12 characters
and no `short_name`:

```json
{
    "name": "Baldwin Museum of Science",
    ...
}
```

Manifest is specified with a `name` longer than 30 characters:

```json
{
    "name": "Baldwin Museum of Science - visit today!",
    "short_name": "Baldwin"
    ...
}
```

Manifest is specified with `short_name` longer than 12 characters:

```json
{
    "name": "Baldwin Museum of Science",
    "short_name": "Baldwin Museum"
    ...
}
```

### Examples that **pass** the hint

Manifest is specified with a `name` shorter than 30 characters
and a `short_name` shorter than 12 characters:

```json
{
    "name": "Baldwin Museum of Science",
    "short_name": "Baldwin"
    ...
}
```

Note: [Not specifying a manifest file](manifest-exists.md) or having
an invalid one are covered by other hints, so those cases won’t make
this hint fail.

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
        "manifest-app-name": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [Web App Manifest specification][manifest spec]

<!-- Link labels: -->

[android]: https://support.google.com/googleplay/android-developer/answer/113469?hl=en#store_listing
[ios]: https://developer.apple.com/app-store/product-page/
[manifest metadata]: https://w3c.github.io/manifest/#authority-of-the-manifest%27s-metadata
[manifest name]: https://w3c.github.io/manifest/#name-member
[manifest short_name]: https://w3c.github.io/manifest/#short_name-member
[manifest spec]: https://w3c.github.io/manifest/
[microsoft store]: https://www.windowscentral.com/first-batch-windows-10-progressive-web-apps-here
[webhint issue]: https://github.com/webhintio/hint/issues/136
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[windows]: https://blogs.windows.com/msedgedev/2018/02/06/welcoming-progressive-web-apps-edge-windows-10/
