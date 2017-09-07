# Require an apple touch icon (`apple-touch-icons`)

`apple-touch-icons` warns against not using a single `180×180px`
PNG image for the `apple-touch-icon`.

## Why is this important?

Safari for iOS supports since `iOS 1.1.3` a way for developers
to specify the image (known as [touch icon][touch icons]) that will
be used when the user adds the web site/app to the homescreen.

Nowadays there is a better and standard way of specifying images
that browsers can use using the [web app manifest file][web app
manifest spec], but unfortunately, Safari for iOS doesn't support
that (yet).

Furthermore, over the years, the requirements for the size of the
touch icon have changed quite a bit:

* `57×57px` – iPhone with @1x display and iPod Touch
* `72×72px` – iPad and iPad mini with @1x display running iOS ≤ 6
* `76×76px` – iPad and iPad mini with @1x display running iOS ≥ 7
* `114×114px` – iPhone with @2x display running iOS ≤ 6
* `120×120px` – iPhone with @2x and @3x display running iOS ≥ 7
* `144×144px` – iPad and iPad mini with @2x display running iOS ≤ 6
* `152×152px` – iPad and iPad mini with @2x display running iOS 7
* `180×180px` – iPad and iPad mini with @2x display running iOS 8+

and developers tend to include all these sizes, but there is no
need to do that. Declaring just one `180×180px` PNG image, e.g.:

```html
<link rel="apple-touch-icon" href="apple-touch-icon.png">
```

in the `<head>` of the page is enough.

Including all the different sizes is actually not even recommended as:

* It will just increase the size of the pages with very little to no
  real benefit (most users will probably not add the site to their
  homescreens).

* Most sizes will probably never be used as iOS devices get upgraded
  pretty quickly, so [most iOS users will be on the latest 2 versions
  of iOS][app store stats], and using newer devices.

* The `180×180px` image, if needed, [will be automatically down scaled
  by Safari, and the result of the scaling is generally ok][icon
  scaling].

The only downside to using one icon is that some users will load
a larger image, while a much smaller file would have worked just
as well. But the chance of that happening decreases with every day
as users upgrade their devices and their iOS version.

Other notes:

* Not declaring the touch icon in the page, and just having it in
  the root of the site is not recommended as [Apple usually changes
  what is requested by default][h5bp issue 1622].

* In older version of Safari for iOS the [`precomposed` keyword][icon
  effects] could be used to prevent iOS from adding different visual
  effects to the touch icon (i.e. rounded corners, drop shadow,
  reflective shine). Starting with iOS 7 no special effects are applied
  to touch icons, so nowadays there is no need to use the `precomposed`
  keyword anymore.

* Safari for iOS &let; 4.2 [ignored the `sizes` attribute, so the order
  in which the icons were declared mattered][icon sizes]. When using
  just one image there is no need to use the `sizes` attribute.

## What does the rule check?

The rule checks if a single `apple-touch-icon` declaration exists in
the `<head>`, and it:

* has `rel="apple-touch-icon"`
* the declared image is accessible (e.g.: doesn't result in a `404`),
  a `PNG`, and its size is `180×180px`
* does not include the `sizes` attribute

### Examples that **trigger** the rule

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

The `apple-touch-icon` has a `sizes` attribute:

```html
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
```

Multiple `apple-touch-icon`s are specified:

```html
<link rel="apple-touch-icon" sizes="57x57" href="/static/images/touch-icons/apple-touch-icon-57x57.png">
<link rel="apple-touch-icon" sizes="60x60" href="/static/images/touch-icons/apple-touch-icon-60x60.png">
<link rel="apple-touch-icon" sizes="72x72" href="/static/images/touch-icons/apple-touch-icon-72x72.png">
<link rel="apple-touch-icon" sizes="76x76" href="/static/images/touch-icons/apple-touch-icon-76x76.png">
<link rel="apple-touch-icon" sizes="114x114" href="/static/images/touch-icons/apple-touch-icon-114x114.png">
<link rel="apple-touch-icon" sizes="120x120" href="/static/images/touch-icons/apple-touch-icon-120x120.png">
<link rel="apple-touch-icon" sizes="144x144" href="/static/images/touch-icons/apple-touch-icon-144x144.png">
<link rel="apple-touch-icon" sizes="152x152" href="/static/images/touch-icons/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="/static/images/touch-icons/apple-touch-icon-180x180.png">
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

The `apple-touch-icon` is not `180x180px`:

```html
<link rel="apple-touch-icon" href="apple-touch-icon.png">
```

```bash
$ file apple-touch-icon.png

apple-touch-icon.png: PNG image data, 180 x 180, ...
```

### Examples that **pass** the rule

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

## Further Reading

* [Everything you always wanted to know about touch
  icons][touch icons]
* [Is there a need for multiple touch icons when just one will work?][h5bp
  issue 1367]

<!-- Link labels: -->

[app store stats]: https://developer.apple.com/support/app-store/
[h5bp issue 1367]: https://github.com/h5bp/html5-boilerplate/issues/1367
[h5bp issue 1622]: https://github.com/h5bp/html5-boilerplate/pull/1622
[icon effects]: https://mathiasbynens.be/notes/touch-icons#effects
[icon scaling]: https://realfavicongenerator.net/blog/how-ios-scales-the-apple-touch-icon/
[icon sizes]: https://mathiasbynens.be/notes/touch-icons#sizes
[touch icons]: https://mathiasbynens.be/notes/touch-icons
[web app manifest spec]: https://w3c.github.io/manifest/
