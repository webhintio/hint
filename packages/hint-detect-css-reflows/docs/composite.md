# Detect CSS Reflows - Composite (`detect-css-reflows/composite`)

Let the developers know if changes to a specific CSS property will trigger
changes on the Composite rendering pipeline.

## Why is this important?

Understanding what rendering pipeline operations will be triggered by changes on
specific CSS properties can prevent users from introducing unintentional
performance hits.

## What does the hint check?

It scans the css properties against a defined properties and associated
rendering triggers.

### Examples that **trigger** the hint

A list of code examples that will fail this hint.
It's good to put some edge cases in here.

### Examples that **pass** the hint

In the following example, this hint will warn user that making changes to
the `accent-color` property will trigger changes on the `Composite` pipeline.

```css
.example {
    accent-color: red;
}
```

## Can the hint be configured?

You can decide the granularity and severity of your reports up to the
following categories:

- detect-css-reflows/composite

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install hint --save-dev
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
        "detect-css-reflows/composite": "error"
    },
    ...
}
```

## Further Reading

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[understanding-critical-path]: https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path
