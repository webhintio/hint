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
  one in old IE]![basecamp](https://user-images.githubusercontent.com/78496768/132597207-619ac6d9-2c48-48de-b014-ca9de076abe7.png)
![basecampy](https://user-images.githubusercontent.com/78496768/132597209-41125633-e0f8-42ad-9953-8a304b38957e.png)
![bowtie](https://user-images.githubusercontent.com/78496768/132597211-beba7530-81dc-43bb-84d8-5a6269311b08.png)
![feelsgood](https://user-images.githubusercontent.com/78496768/132597213-7969b9dc-f984-479d-ac1a-81b184eeaec6.png)
![finnadie](https://user-images.githubusercontent.com/78496768/132597216-442c850e-ef31-401c-a564-f81b1b58ce22.png)
![fu](https://user-images.githubusercontent.com/78496768/132597217-d4486dae-e047-4750-b03b-d97865f398e6.png)
![goberserk](https://user-images.githubusercontent.com/78496768/132597219-9fe6bbc9-e4a2-4fdf-9e98-f385b28b47ce.png)
![godmode](https://user-images.githubusercontent.com/78496768/132597221-a86b1983-8102-4102-91d8-8ad7ef80cd79.png)
![hurtrealbad](https://user-images.githubusercontent.com/78496768/132597224-61414e73-01e3-4c2a-9bec-988a83f1e54c.png)
![metal](https://user-images.githubusercontent.com/78496768/132597225-a8dd34c3-a587-40d5-ae5a-4376470bb59d.png)
![neckbeard](https://user-images.githubusercontent.com/78496768/132597227-c102bd1e-f841-4ff9-bde6-83b5b97db380.png)
![octocat](https://user-images.githubusercontent.com/78496768/132597228-c97baca7-bea9-47c1-b786-9519b8f7f6b1.png)
![rage1](https://user-images.githubusercontent.com/78496768/132597230-aa652028-fce6-4a3e-b469-cc922daa9e87.png)
![rage2](https://user-images.githubusercontent.com/78496768/132597231-51ef4e98-e4a5-4e44-a64a-cdc3b3e2a08e.png)
![rage3](https://user-images.githubusercontent.com/78496768/132597234-f3a86adc-e1c4-4048-b035-64b7b9be3cdd.png)
![rage4](https://user-images.githubusercontent.com/78496768/132597236-0a359b39-7096-411d-bffe-50e6a9d4cedd.png)
![shipit](https://user-images.githubusercontent.com/78496768/132597237-08458c8a-43f6-4f79-9fc0-be79fc5cc6c0.png)
![suspect](https://user-images.githubusercontent.com/78496768/132597238-5a2c6694-1311-4499-aa49-e5024a2930c9.png)
![taco](https://user-images.githubusercontent.com/78496768/132597239-7d1b9566-3041-4f2f-a988-4596a1599452.png)
![trollface](https://user-images.githubusercontent.com/78496768/132597243-ebb6b4b1-af47-4b5c-b4e7-6c789cd36ae5.png)
[ie issue]).

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
