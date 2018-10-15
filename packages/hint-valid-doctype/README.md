# Check that the Doctype tag of the document is valid

This hint checks if there is a valid in the document.

## Why is this important?

Because have a valid doctype will give to the browser the correct information about the version of HTML.

## What does the hint check?

The hint checks that the doctype is `<!doctype html>` and is in the first line of the document.

### Examples that **trigger** the hint

An uppercase doctype should fail, also if the doctype is not in the first line.

### Examples that **pass** the hint

A doctype in the first line, without other information in that line.

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-valid-doctype
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
        "valid-doctype": "error"
    },
    ...
}
```

## Further Reading

What can the user read to know more about this subject?


* [Doctype (Wikipedia)][docwiki]
* [Doctype (MDN)][docmdn]

<!-- Link labels: -->

[docwiki]: https://en.wikipedia.org/wiki/Document_type_declaration
[docmdn]: https://developer.mozilla.org/en-US/docs/Glossary/Doctype
