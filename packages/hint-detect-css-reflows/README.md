# hint-detect-css-reflows (`hint-detect-css-reflows`)

Let the developers know if changes to a specific CSS property will trigger
changes on the Layout, Composite or Paint rendering pipeline.

## Why is this important?

Understanding what rendering pipeline operations will be triggered by changes
on specific CSS properties can prevent users from introducing unintentional
performance hits.

## What does the hint check?

It scans the css properties against a defined properties and associated
rendering triggers.

### Examples that **trigger** the hint

A list of code examples that will fail this hint.
It's good to put some edge cases in here.

### Examples that **pass** the hint

In the following example, this hint will warn user that making changes to
the `padding-left` property will trigger changes on the `Layout` and `Paint`
pipeline.

```css
.example {
    padding-left: auto;
}
```

## Can the hint be configured?

You can decide the granularity and severity of your reports up to the
following categories:

- hint-detect-css-reflows/composite
- hint-detect-css-reflows/layout
- hint-detect-css-reflows/paint

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install hint-detect-css-reflows
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
        "hint-detect-css-reflows/composite": "off",
        "hint-detect-css-reflows/layout": "hint",
        "hint-detect-css-reflows/paint": "off"
    },
    ...
}
```

## Further Reading

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[understanding-critical-path]: https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path
