# summary-display (`@hint/hint-summary-display`)

Summary tag should have `display: list-item` to avoid hiding open/close icon.

## Why is this important?

Changing the display on a summary tag to anything other than list-item
will cause the open/close icon to disappear in browsers which implement
the latest version of the standard (e.g. Firefox).
Chrome has [a bug open][chrome bug] to track aligning with the spec and
Firefox in the future.

## What does the hint check?

The hint examines any CSS rule that targets a `<summary>` tag and changes the
`display` to anything other than `display: list-item`.

### Examples that **trigger** the hint

Any CSS rule targeting a `summary` tag that alters the display to anything
other than `list-item`:

Example:

```css
summary {
    display: block;
}
```

Class or id of summary tag that alters the display property:

Example:

```css
summary.foo {
    display: inline;
}
```

### Examples that **pass** the hint

If the summary tag does not change the display property at all:

Example:

```css
summary {
    margin: 10px;
}
```

If there is no summary tag in the css file:

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-summary-display
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
        "summary-display": "error"
    },
    ...
}
```

## Further Reading

What can the user read to know more about this subject?

<!-- Link labels: -->

[chrome bug]: https://bugs.chromium.org/p/chromium/issues/detail?id=590014
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
