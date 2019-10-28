# Use charset `utf-8` (`meta-charset-utf-8`)

`meta-charset-utf-8` checks if the page explicitly declares the
character encoding as `utf-8` using a meta tag early in the document.

## Why is this important?

The character encoding should be specified for every HTML page, either
by using the charset parameter on the `Content-Type` HTTP response
header (e.g.: `Content-Type: text/html; charset=utf-8`) and/or using
the charset meta tag in the file.

Sending the `Content-Type` HTTP header is in general ok, but it’s
usually a good idea to also add the charset meta tag because:

* Server configurations might change (or servers might not send the
  charset parameter on the `Content-Type` HTTP response header).
* The page might be saved locally, in which case the HTTP header will
  not be present when viewing the page.

One should [always choose `utf-8` as the encoding and convert any
content in legacy encodings to `utf-8`][why use utf-8].

As for the charset meta tag, always use `<meta charset="utf-8">` as:

* [It's backwards compatible and works in all known browsers][html5
  character encoding], so it should always be used over the old
  `<meta http-equiv="Content-Type" content="text/html;charset=UTF-8">`.

* The `charset` value should be `utf-8`, not any other values such as
  `utf8`. Using `utf8`, for example, is a common mistake, and even
  though it is valid nowadays as the [specifications][spec aliases]
  and browsers now alias `utf8` to `utf-8`, that wasn’t the case in
  the past, so things might break in [some older browsers][utf8
  example]. The same may be true for other agents (non-browsers) that
  may scan/get the content and may not have the alias.

* It needs to be inside the `<head>` element and [within the first
  1024 bytes of the HTML][whatwg charset], as some browsers only
  look at those bytes before choosing an encoding.

  Moreover, it is recommended that the meta tag be the first thing
  in the `<head>`. This ensures it is before any content that could
  be controlled by an attacker, such as a `<title>` element, thus
  avoiding potential encoding-related security issues ([such as the
  one in old IE][ie issue]).

## What does the hint check?

The hint checks if `<meta charset="utf-8">` is specified as the first
thing in the `<head>`.

### Examples that **trigger** the hint

The character encoding is not specified in `<html>`:

```html
<!doctype html>
<html lang="en">
    <head>
        <title>example</title>
        ...
    </head>
    <body>...</body>
</html>
```

The character encoding is specified using the `meta http-equiv`:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
        <title>example</title>
        ...
    </head>
    <body>...</body>
</html>
```

The `charset` value is not `utf-8`:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf8">
        <title>example</title>
        ...
    </head>
    <body>...</body>
</html>
```

The `meta charset` is not the first thing in `<head>`:

```html
<!doctype html>
<html lang="en">
    <head>
        <title>example</title>
        <meta charset="utf8">
        ...
    </head>
    <body>...</body>
</html>
```

### Examples that **pass** the hint

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
        "meta-charset-utf-8": "error"
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [Declaring the Character Encoding](https://blog.whatwg.org/meta-charset)
* [The Road to HTML 5: character encoding][html5 character encoding]
* [Declaring character encodings in HTML](https://www.w3.org/International/questions/qa-html-encoding-declarations.en)
* [Choosing & applying a character encoding](https://www.w3.org/International/questions/qa-choosing-encodings)

<!-- Link labels: -->

[html5 character encoding]: https://blog.whatwg.org/the-road-to-html-5-character-encoding
[ie issue]: https://msdn.microsoft.com/en-us/library/dd565635.aspx
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[spec aliases]: https://encoding.spec.whatwg.org/#names-and-labels
[utf8 example]: https://twitter.com/jacobrossi/status/591435377291866112
[whatwg charset]: https://html.spec.whatwg.org/multipage/semantics.html#charset
[why use utf-8]: https://www.w3.org/International/questions/qa-choosing-encodings#useunicode
