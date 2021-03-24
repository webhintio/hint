# Use Apple touch icon (`apple-touch-icons`)

`apple-touch-icons` requires that at least one Apple touch icon is present and
of a standard size.

## Why is this important?

Since `iOS 1.1.3`, Safari for iOS has supported a way for developers
to specify an image that will be used to represent the web site or app
on the home screen. The image is known as the [touch icon][touch icons].

```html
<link rel="apple-touch-icon" href="apple-touch-icon.png">
```

Per Apple's [current guidance][apple icon sizes], default touch icon sizes
are as follows:

Device or context | Icon size
-- | --
iPhone | 180px × 180px (60pt × 60pt @3x)
iPhone (X/Plus) | 120px × 120px (60pt × 60pt @2x)
iPad Pro | 167px × 167px (83.5pt × 83.5pt @2x)
iPad, iPad mini | 152px × 152px (76pt × 76pt @2x)

Other notes:

* Not declaring the touch icon in the page and having it in the
  root of the site is not recommended, as [Apple may change what is
  requested by default][h5bp issue 1622].

* In older versions of Safari for iOS, the [`precomposed` keyword][icon
  effects] could be used to prevent iOS from adding different visual
  effects to the touch icon (*i.e.,* rounded corners, drop shadow,
  reflective shine). Starting with iOS 7, no special effects are applied
  to touch icons, so there is no need to use the `precomposed`
  keyword anymore.

* When using one image, there is no need to use the `sizes` attribute.

* As of `iOS 11.1.0`, Safari for iOS
  [supports the web app manifest file][safari 11.1] which provides a standard,
  cross-browser way of defining, among other, the icons browsers can use in
  various contexts (home screen, application menu, *etc.*). However, Safari
  ignores the icons defined in the web app manifest and still uses the
  non-standard `apple-touch-icon`.

## What does the hint check?

The hint checks if one or more `apple-touch-icon` declarations exist in
the `<head>`, and:

* each has `rel="apple-touch-icon"`
* each declared image is accessible (*e.g.,* doesn’t result in a `404`),
* each declared image is a `PNG` of one of the resolutions specified above

### Examples that **trigger** the hint

No `apple-touch-icon` was specified:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        ...

    </head>
    <body>...</body>
</html>
```

The `apple-touch-icon` is not specified in `<head>`:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        ...

    </head>
    <body>
        <link rel="apple-touch-icon" href="apple-touch-icon.png">
        ...
    </body>
</html>
```

The `apple-touch-icon` has a `rel` attribute different than
`apple-touch-icon`:

```html
<link rel="apple-touch-icon-precomposed" sizes="180x180" href="apple-touch-icon-precomposed.png">
```

The `apple-touch-icon` is not accessible:

```html
<link rel="apple-touch-icon" href="apple-touch-icon.png">
```

Response for `apple-touch-icon.png`:

```text

HTTP/... 404 Not Found
...
```

```text

HTTP/... 500 Internal Server Error
...
```

The `apple-touch-icon` is not a `PNG` file:

```html
<link rel="apple-touch-icon" href="apple-touch-icon.png">
```

```bash
$ file apple-touch-icon.png

apple-touch-icon.png: JPEG image data, ...
```

One or more `apple-touch-icon` files is not a recommended size:

```html
<link rel="apple-touch-icon" href="apple-touch-icon.png">
```

```bash
$ file apple-touch-icon.png

apple-touch-icon.png: PNG image data, 16 x 16, ...
```

### Examples that **pass** the hint

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        ...
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        ...

    </head>
    <body>...</body>
</html>
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
        "apple-touch-icons": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [Everything you always wanted to know about touch
  icons][touch icons]
* [Is there a need for multiple touch icons when one will work?][h5bp
  issue 1367]

<!-- Link labels: -->
[apple icon sizes]: https://developer.apple.com/design/human-interface-guidelines/ios/icons-and-images/app-icon/
[h5bp issue 1367]: https://github.com/h5bp/html5-boilerplate/issues/1367
[h5bp issue 1622]: https://github.com/h5bp/html5-boilerplate/pull/1622
[icon effects]: https://mathiasbynens.be/notes/touch-icons#effects
[icon scaling]: https://realfavicongenerator.net/blog/how-ios-scales-the-apple-touch-icon/
[safari 11.1]: https://developer.apple.com/library/content/releasenotes/General/WhatsNewInSafari/Articles/Safari_11_1.html#//apple_ref/doc/uid/TP40014305-CH14-SW6
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[touch icons]: https://mathiasbynens.be/notes/touch-icons
[web app manifest spec]: https://w3c.github.io/manifest/
