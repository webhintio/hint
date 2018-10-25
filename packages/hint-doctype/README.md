# Check that the DOCTYPE tag of the document is valid

This hint checks if the HTML is using the most modern DOCTYPE.

## Why is this important?

> In HTML, the doctype is the required "<!DOCTYPE html>" preamble
found at the top of all documents. Its sole purpose is to prevent
a browser from switching into so-called “quirks mode” when rendering
a document; that is, the "<!DOCTYPE html>" doctype ensures that the
browser makes a best-effort attempt at following the relevant specifications,
rather than using a different rendering mode that is incompatible
with some specifications.

***From [MDN glossary for DOCTYPE specification][docmdn].***

## What does the hint check?

This hint checks if the HTML is using the most modern and valid DOCTYPE.

It checks that the DOCTYPE is in the first line and that there are no other
lines before the DOCTYPE. This is important as some browsers,
including versions of IE prior to IE10, trigger quirks mode if a comment
occurs before the DOCTYPE.

It checks that there is no additional info apart from the DOCTYPE on the same
line and that it is not duplicated elsewhere in the document. To support older
HTML content generators, it also accepts the legacy-compat DOCTYPE. Examples:

`<!DOCTYPE html>`

`<!doctype html>`

`<!DOCTYPE html SYSTEM "about:legacy-compat">`

### Examples that **trigger** the hint

The hint will trigger if the DOCTYPE is not in the first line:

```html
<!--first line taken up by this unnecessary comment-->
<!DOCTYPE html>
```

The hint will trigger if you use an old DOCTYPE:

```html
<!DOCTYPE html PUBLIC
  "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
```

It will trigger if there are multiple DOCTYPEs:

```html
<!DOCTYPE html>
<!--some content below the DOCTYPE-->
<!DOCTYPE html>
<!--more content below the second DOCTYPE-->
```

### Examples that **pass** the hint

A DOCTYPE in the first line, without other information in that line.

```html
<!DOCTYPE html>
<!--all content below the DOCTYPE-->
```

A legacy compat DOCTYPE in the first line, without other information in that line.

```html
<!DOCTYPE html SYSTEM "about:legacy-compat">
<!--all content below the DOCTYPE-->
```

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-DOCTYPE
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
        "doctype": "error"
    },
    ...
}
```

## Further Reading

* [DOCTYPE (Wikipedia)][docwiki]
* [DOCTYPE (MDN)][docmdn]

<!-- Link labels: -->

[docwiki]: https://en.wikipedia.org/wiki/Document_type_declaration
[docmdn]: https://developer.mozilla.org/en-US/docs/Glossary/DOCTYPE
