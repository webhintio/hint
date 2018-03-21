# Require a web app manifest file (`@sonarwhal/rule-manifest-exists`)

`manifest-exists` warns against not providing a [web app manifest][spec]
file.

## Why is this important?

The web app manifest file constitutes a standard centralized place
to put metadata about your site/web app, and providing it:

* informs browsers (and possible [others][windows] where to look for
  information about your site/web app, information that they may need
  in different contexts (e.g. what icon and name should they use for
  your site/web app when the user adds it to the homescreen)

* is an essential piece in the context of progressive web apps,
  being one of the signals used by some browsers (e.g. [Chrome][chrome],
  [opera][opera], [samsung internet][samsung internet]) in deciding if
  they will show the add to homescreen prompt to users

## What does the rule check?

This rule checks if:

* The web app manifest file is specified correctly in the page
  (i.e. the page contains a single, valid declaration such as:
  `<link rel="manifest" href="site.webmanifest">`)

* The specified web app manifest file is accessible (i.e. requesting
  it doesn’t result in a `404`, `500`, etc.)

### Examples that **trigger** the rule

The web app manifest file is not specified:

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

The location of the web app manifest file is not specified:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        <link rel="manifest">
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
        <link rel="manifest" href="">
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
        <link rel="manifest" hrref="site.webmanifest">
        ...
    </head>
    <body>...</body>
</html>
```

More than one web app manifest file is specified:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        <link rel="manifest" href="site.webmanifest">
        <link rel="manifest" href="another-site.webmanifest">
        ...
    </head>
    <body>...</body>
</html>
```

### Examples that **pass** the rule

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        <link rel="manifest" href="site.webmanifest">
        ...
    </head>
    <body>...</body>
</html>
```

## Further Reading

* [Web App Manifest Specification][spec]

<!-- Link labels: -->

[chrome]: https://developers.google.com/web/fundamentals/engage-and-retain/app-install-banners/
[opera]: https://dev.opera.com/blog/web-app-install-banners/
[samsung internet]: https://medium.com/samsung-internet-dev/what-does-it-mean-to-be-an-app-ace43eb6b94d
[spec]: https://www.w3.org/TR/appmanifest
[windows]: https://medium.com/web-on-the-edge/progressive-web-apps-on-windows-8d8eb68d524e
