# Require charset meta tag with the value of `utf-8` (`meta-charset-utf-8`)

`meta-charset-utf-8` warns against not declaring the character encoding
as `utf-8` inline.

## Why is this important?

The character encoding should be specified for every HTML page, either
by using the charset parameter on the `Content-Type` HTTP response
header (e.g.: `Content-Type: text/html; charset=utf-8`) and/or using
the charset meta tag in the file.

Sending just the `Content-Type` HTTP header is in general ok, but it's
usually a good idea to also add the charset meta tag because:

* Server configurations might change (or servers might not send the
  charset parameter on the `Content-Type` HTTP response header).
* The page might be saved locally, case in which the HTTP header will
  not be present when viewing the page.

One should [always choose `utf-8` as the encoding, and convert any
content in legacy encodings to `utf-8`](https://www.w3.org/International/questions/qa-choosing-encodings#useunicode)

For the charset meta tag `<meta charset="utf-8">` should be used.

`<meta charset="utf-8">`:

* [Is backwards compatible and works in all known
   browsers](https://blog.whatwg.org/the-road-to-html-5-character-encoding),
   so it should always be used over the old
  `<meta http-equiv="Content-Type" content="text/html;charset=UTF-8">`.

* The `charset` value should be `utf-8` not other values such as `utf8`.
  Using `utf8` for example, is a common mistake, and even though it is
  valid nowadays as the [specifications](https://encoding.spec.whatwg.org/#names-and-labels)
  and browsers now alias `utf8` to `utf-8`, that wasn't the case in the
  past, so things might break in [some older
  browsers](https://twitter.com/jacobrossi/status/591435377291866112).
  The same may be true for other agents (non-browsers) that may scan/get
  the content and may not have the alias.

* Must be inside the `<head>` element and [within the first 1024
  bytes of the HTML](https://html.spec.whatwg.org/multipage/semantics.html#charset),
  as some browsers only look at those bytes before choosing an encoding.

  Moreover, it is recomanded that the meta tag be the first thing
  in the `<head>`. This ensures it is before any content that could
  be controlled by an attacker, such as a `<title>` element, thus,
  avoiding potential encoding-related security issues ([such as the
  one in old IE](https://msdn.microsoft.com/en-us/library/dd565635.aspx).

## What does the rule check?

The rule checks if `<meta charset="utf-8">` is specified as the first
thing in the `<head>`.

Examples that **trigger** the rule:

* The character encoding is not specified in the html.

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

* The character encoding is specified using the meta `http-equiv`.

  ```html
  <!doctype html>
  <html lang="en">
      <head>
          <meta http-equiv="content-type" content="text/html; charset=utf-8">
          ...
      </head>
      <body>...</body>
  </html>
  ```

* The charset value is not `utf-8`.

  ```html
  <!doctype html>
  <html lang="en">
      <head>
          <meta charset="utf8">
          ...
      </head>
      <body>...</body>
  </html>
  ```

* The meta charset is not the first thing in `<head>`.

  ```html
  <!doctype html>
  <html lang="en">
      <head>
          <title></title>
          <meta charset="utf8">
          ...
      </head>
      <body>...</body>
  </html>
  ```

Example that **passes** the rule:

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

## Further Reading

* [Declaring the Character Encoding](https://blog.whatwg.org/meta-charset)
* [The Road to HTML 5: character encoding](https://blog.whatwg.org/the-road-to-html-5-character-encoding)
* [Declaring character encodings in HTML](https://www.w3.org/International/questions/qa-html-encoding-declarations.en)
* [Choosing & applying a character encoding](https://www.w3.org/International/questions/qa-choosing-encodings)
