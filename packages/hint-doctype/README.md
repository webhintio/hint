# Check if the page has the most modern document type declaration

This hint checks if the HTML is using the most modern document type
declaration (a.k.a. `doctype`).

## Why is this important?

> In HTML, the doctype is the required "\<!DOCTYPE html>" preamble
found at the top of all documents. Its sole purpose is to prevent
a browser from switching into so-called “quirks mode” when rendering
a document; that is, the "\<!DOCTYPE html>" doctype ensures that
the browser makes a best-effort attempt at following the relevant
specifications, rather than using a different rendering mode that
is incompatible with some specifications.

***From [MDN glossary for DOCTYPE specification][docmdn].***

## What does the hint check?

This hint checks if the HTML is using the most modern document type
declaration (a.k.a. `doctype`).

Examples of the `doctype` declaration:

`<!doctype html>`

`<!DOCTYPE html>`

It checks that the `doctype` is in the first line. If there
are lines preceeding the `doctype`, it checks that these lines
consist of whitespace only. This is important as some browsers,
including versions of Internet Explorer prior to version 10,
trigger quirks mode if a comment occurs before the `doctype`.

It also checks that the `doctype` is not duplicated elsewhere
in the document.

Although an alternative legacy compatibility `doctype` is available,
this hint does not recommend it. It is a common misconception that
the legacy compatibility `doctype` refers to compatibility with
legacy browsers, when, in fact, it is used to deal with [compatibility
issues with outdated XML tools][compat issue].

### Examples that **trigger** the hint

The hint will trigger if the preceeding line or line before the
`doctype` contains anything other than whitespace.

```html
<!--first line taken up by this unnecessary comment-->
<!doctype html>
```

The hint will trigger if you use an old `doctype`:

```html
<!doctype html PUBLIC
  "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
```

The hint will will trigger if there are multiple `doctype`s:

```html
<!doctype html>
<!--some content below the doctype-->
<!doctype html>
<!--more content below the second doctype-->
```

The hint will trigger if a legacy compat `doctype` is used:

```html
<!doctype html SYSTEM "about:legacy-compat">
<!--all content below the doctype-->
```

### Examples that **pass** the hint

A `doctype` in the first line.

```html
<!doctype html>
<!--all content below the doctype-->
```

```html
<!DOCTYPE html>
<!--all content below the doctype-->
```

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-doctype
```

Note: You can make `npm` install it as a `devDependency` using
the `--save-dev` parameter, or to install it globally, you can
use the `-g` parameter. For other options see [**npm's**
documentation][npm docs].

And then activate it via the `.hintrc` or `hintrc`
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": [...],
    "hints": {
        "doctype": "error",
        ...
    },
    ...
}
```

## Further Reading

* [`doctype` (Wikipedia)][docwiki]
* [`doctype` (MDN)][docmdn]
* [Activating Browser Modes with `doctype`][hsivonen]

<!-- Link labels: -->

[compat issue]: http://bugzilla.bluegriffon.org/show_bug.cgi?id=634#c0
[docmdn]: https://developer.mozilla.org/en-US/docs/Glossary/DOCTYPE
[docwiki]: https://en.wikipedia.org/wiki/Document_type_declaration
[hsivonen]: https://hsivonen.fi/doctype/
[npm docs]: https://docs.npmjs.com/cli/install
