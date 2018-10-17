# Check that the DOCTYPE tag of the document is valid

This hint checks if the HTML is using the most modern DOCTYPE.

## Why is this important?

In HTML, the doctype is the required "<!DOCTYPE html>" preamble
found at the top of all documents. Its sole purpose is to prevent
a browser from switching into so-called “quirks mode” when rendering
a document; that is, the "<!DOCTYPE html>" doctype ensures that the
browser makes a best-effort attempt at following the relevant specifications,
rather than using a different rendering mode that is incompatible
with some specifications.

[MDN - Doctype](https://developer.mozilla.org/en-US/docs/Glossary/Doctype)

## What does the hint check?

The hint checks that the DOCTYPE is `<!DOCTYPE html>`
and is in the first line of the document.

### Examples that **trigger** the hint

Also the hint will trigger if the DOCTYPE is not in the first line, for example

```html
<!--first line taken up by this unnecessary comment-->
<!DOCTYPE html>
```

### Examples that **pass** the hint

A DOCTYPE in the first line, without other information in that line.

```html
<!DOCTYPE html>
<!--all content below the DOCTYPE tag-->
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

What can the user read to know more about this subject?

* [DOCTYPE (Wikipedia)][docwiki]
* [DOCTYPE (MDN)][docmdn]

<!-- Link labels: -->

[docwiki]: https://en.wikipedia.org/wiki/Document_type_declaration
[docmdn]: https://developer.mozilla.org/en-US/docs/Glossary/DOCTYPE
