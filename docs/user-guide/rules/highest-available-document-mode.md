# Require highest available document mode (`highest-available-document-mode`)

`highest-available-document-mode` warns against not informing browsers
that support document modes to use the highest one available.

## Why is this important?

Internet Explorer 8/9/10 support [document compatibility
modes](https://msdn.microsoft.com/en-us/library/cc288325.aspx).
Because of this, even if the site's visitor is using, let's say,
Internet Explorer 9, it's possible that Internet Explorer will not
use the latest rendering engine, and instead, decide to render your
page using the Internet Explorer 5.5 rendering engine.

Serving the page with the following HTTP response header:

```text
X-UA-Compatible: ie=edge
```

or specifying the `x-ua-compatible` meta tag:

```html
<meta http-equiv="x-ua-compatible" content="ie=edge">
```

will force Internet Explorer 8/9/10 to render the page in the
highest available mode in [the various cases when it may
not](https://hsivonen.fi/doctype/#ie8), and therefore, ensure that
anyone browsing the site from those browsers is treated to the best
possible user experience that browser can offer.

If possible, it is recommended to send the HTTP response header
instead of using the `meta` tag, as the latter will not always work
(e.g.: if the site is served on a non-standard port, as Internet
Explorer's preference option `Display intranet sites in Compatibility
View` is checked by default).

Notes:

* If the `meta` is used, it should to be included in the `<head>`
  before all other tags except for the `<title>` and the other
  `<meta>` tags.

* Appending `chrome=1` to the value of the HTTP response header or
  the meta tag is no longer recommended as [`Chrome Frame` has been
  deprecated](https://blog.chromium.org/2013/06/retiring-chrome-frame.html)
  for quite some time.

## What does the rule check?

By default the rule checks if the `X-UA-Compatible` response header is
sent with the value of `IE=edge`, and that the `meta` tag isn't used.

### Examples that **trigger** the rule for defaults

`X-UA-Compatible` response header is not sent:

```text
HTTP/... 200 OK

...
```

`X-UA-Compatible` response header is sent with a value different
than `ie=edge`:

```text
HTTP/... 200 OK

...
X-UA-Compatible: IE=7
```

```text
HTTP/... 200 OK

...
X-UA-Compatible: ie=edge,chrome=1
```

`X-UA-Compatible` response header is sent, but the `meta` tag is
also specified:

```text
HTTP/... 200 OK

...
X-UA-Compatible: ie=edge
```

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>example</title>
        ...
    </head>
    <body>...</body>
</html>
```

### Examples that **pass** the rule for defaults

```text
HTTP/... 200 OK

...
X-UA-Compatible: ie=edge
```

The rule [can be configured](#can-the-rule-be-configured) to require
the `X-UA-Compatible` meta tag. This option is indicated mainly for the
case when the HTTP response header cannot be set.

### Examples that **trigger** the rule

`X-UA-Compatible` meta tag is not specified:

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

`X-UA-Compatible` meta tag is specified with a value different than
`ie=edge`:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=9">
        <title>example</title>
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
        <meta http-equiv="x-ua-compatible" content="ie=edge,chrome=1">
        <title>example</title>
        ...
    </head>
    <body>...</body>
</html>
```

`X-UA-Compatible` meta tag is specified in the `<body>`:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        ...
    </head>
    <body>
        ...
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        ...
    </body>
</html>
```

`X-UA-Compatible` meta tag is specified in the `<head>`, but it's
not included before all other tags except for the `<title>` and the
other `<meta>` tags:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        <script src="example.js"></script>
        <meta http-equiv="x-ua-compatible" content="ie=9">
        ...
    </head>
    <body>...</body>
</html>
```

### Examples that **pass** the rule

```text
HTTP/... 200 OK

...
X-UA-Compatible: ie=edge
```

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <script src="example.js"></script>
        ...
    </head>
    <body>...</body>
</html>
```

## Can the rule be configured?

`requireMetaTag` can be set to `true` to allow and require the use of
`meta` tag.

```json
"highest-available-document-mode": [ "warning", {
    "requireMetaTag": true
}]
```

Also, note that this rule takes into consideration the [targeted
browsers](../index.md#browser-configuration), and if Internet Explorer
8/9/10 aren't among them, it will suggest removing the `meta` tag or/and
not sending the HTTP response header.

## Further Reading

* [Internet Explorer 8/9/10 Complications](https://hsivonen.fi/doctype/#ie8)
* [Specifying legacy document modes](https://msdn.microsoft.com/en-us/library/jj676915.aspx)
