# Correct viewport (`meta-viewport`)

`meta-viewport` warns against not having a single `viewport` meta
tag in the `<head>` with the proper value.

## Why is this important?

The viewport meta tag is an essential part of responsive web design,
that may also offer some [performance improvements][gpu rasterization].

> Mobile browsers render pages in a virtual "window" (the viewport),
> usually wider than the screen, so they don’t need to squeeze every
> page layout into a tiny window (which would break many
> non-mobile-optimized sites). Users can pan and zoom to see different
> areas of the page.
>
> Mobile Safari introduced the "viewport meta tag" to let web
> developers control the viewport’s size and scale. Many other mobile
> browsers now support this tag.
>
> In recent years, screen resolutions have risen to the size that
> individual pixels are hard to distinguish with the human eye.
> For example, recent smartphones generally have a 5-inch screens with
> resolutions upwards of 1920—1080 pixels (~400 dpi). Because of this,
> many browsers can display their pages in a smaller physical size by
> translating multiple hardware pixels for each CSS "pixel". Initially
> this caused usability and readability problems on many touch-optimized
> web sites.

*[Using the viewport meta tag to control layout on mobile devices
(MDN)][viewport meta tag on mdn]*

The viewport related topic is very complex so if you want to dig
deeper, read Peter-Paul Koch’s "A tale of two viewports" [part
one][ppk article 1] and [part two][ppk article 2], or watch his
talk ['The Mobile Viewports'][ppk talk].

**NOTE:** If your website is not responsive, then this meta tag
might not be needed.

Ideally the following meta `viewport` tag should be used:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Or, if most of your users don’t use Safari for iOS < 9:

```html
<meta name="viewport" content="width=device-width">
```

Notes:

* It is recommended to use:

  * `width=device-width`

    * `device-width` will make the page match the screen’s width in
      device-independent pixels, allowing its content to reflow to
      match different screen sizes.

      Setting the `width` property to a specific size (e.g.: `width=320`)
      is [not recommended][fixed width problem].

    * Having `width=device-width` also constitutes a performance
      improvement, as under most circumstances, it enables fast tapping,
      removing the 300-350 ms tap delay on [Safari for iOS 10+][ios 10
      interaction behaviors] and [other mobile browsers][tap delay].

  * `initial-scale=1`

    * This is mostly needed to [work around the orientation change bug
      from Safari for iOS < 9][ios orientation change scaling].

    * Using values different then `1` (or `1.0`) are
      [problematic](https://www.quirksmode.org/mobile/metaviewport/#link15).

* `user-scalable`, `maximum-scale`, and `minimum-scale` properties
  should not be used.

  These properties can block the user from zooming on a page.
  With such a wide range of devices available with different
  display dimensions, screen resolutions, pixel densities, etc.,
  it is difficult to choose an appropriate text size in a design.
  Most of the time using these properties enable users to pick a
  text size that is unreadable while preventing them from zooming,
  frustrating them, or making the web site/app inaccessible in
  some cases.

  Considering the issues described, these properties are now
  ignored by some mobile browsers such as [Safari for iOS 10+][ios
  10 interaction behaviors].

## What does the hint check?

The hint checks if the `viewport` meta tag was specified a single
time in the `<head>`, and if:

* the `width` property is provided and its value is `device-width`
* the `initial-scale` property is provided (note: [depends on the
  configurations](#can-the-hint-be-configured)) and its value is
  `1` or `1.0`
* `user-scalable`, `maximum-scale`, or `minimum-scale` are used
* it includes unknown properties (e.g.: `x=y`) or invalid values
  (`width=x`)

### Examples that **trigger** the hint

The `viewport` meta tag is not specified in `<head>`:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        ...
    </head>
    <body>
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </body>
</html>
```

The `viewport` meta tag contains an unknown property:

```html
<meta name="viewport" content="unknown-property=1, width=device-width, initial-scale=1">
```

The `viewport` meta tag contains an invalid value:

```html
<meta name="viewport" content="width=invalid-value, initial-scale=1">
```

The `viewport` meta tag contains a disallowed property (`user-scalable`):

```html
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
```

The `viewport` meta tag contains a fixed `width` value:

```html
<meta name="viewport" content="width=320, initial-scale=1">
```

The `viewport` meta tag contains `initial-scale` with a value
different than `1` or `1.0`:

```html
<meta name="viewport" content="width=device-width, initial-scale=5">
```

There are multiple `viewport` meta tags:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ...
        <meta name="viewport" content="width=device-width">
        ...
    </head>
    <body>...</body>
</html>
```

### Examples that **pass** the hint

If versions of Safari for iOS < 9 are targeted:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ...
    </head>
    <body>...</body>
</html>
```

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no, viewport-fit=cover">
        ...
    </head>
    <body>...</body>
</html>
```

If versions of Safari for iOS 9+ are targeted:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        <meta name="viewport" content="width=device-width">
        ...
    </head>
    <body>...</body>
</html>
```

## Can the hint be configured?

This hint takes into consideration the [targeted
browsers][browser configuration], and if no
versions of Safari for iOS < 9 are included, it will not
require `initial-scale=1`.

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
        "meta-viewport": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [Peter-Paul Koch - A Tale of Two Viewports - Part 1][ppk article 1]
* [Peter-Paul Koch - A Tale of Two Viewports - Part 2][ppk article 2]
* [Peter-Paul Koch’s meta viewport tests][ppk tests]
* [New Interaction Behaviors in Safari for iOS 10][ios 10 interaction behaviors]
* [Viewport meta tag specification][spec]
* [300ms tap delay, gone away][tap delay]
* [Scaling in Safari for iOS][ios orientation change scaling]

<!-- Link labels: -->

[fixed width problem]: http://starkravingfinkle.org/blog/2010/01/perils-of-the-viewport-meta-tag/
[gpu rasterization]: https://www.chromium.org/developers/design-documents/chromium-graphics/how-to-get-gpu-rasterization
[ios 10 interaction behaviors]: https://webkit.org/blog/7367/new-interaction-behaviors-in-ios-10/
[ios orientation change scaling]: https://www.quirksmode.org/blog/archives/2013/10/more_about_scal.html
[mdn viewport meta tag]: https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag
[ppk article 1]: https://www.quirksmode.org/mobile/viewports.html
[ppk article 2]: https://www.quirksmode.org/mobile/viewports2.html
[ppk initial-scale]: https://www.quirksmode.org/mobile/metaviewport/#link15
[ppk talk]: https://www.youtube.com/watch?v=8J6EdpXdzqc
[ppk tests]: https://www.quirksmode.org/mobile/metaviewport/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[spec]: https://drafts.csswg.org/css-device-adapt/#viewport-meta
[tap delay]: https://developers.google.com/web/updates/2013/12/300ms-tap-delay-gone-away
[viewport meta tag on mdn]: https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag
[browser configuration]: https://webhint.io/docs/user-guide/configuring-webhint/browser-context/
