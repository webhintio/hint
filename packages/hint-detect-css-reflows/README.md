# Detect CSS Reflows (`detect-css-reflows`)

Let the developers know if changes to a specific CSS property inside @keyframes
will trigger changes on the Layout, Composite or Paint rendering pipeline.

## Why is this important?

Understanding what rendering pipeline operations will be triggered by changes
on specific CSS properties can prevent users from introducing unintentional
performance hits. `Paint` and `Layout` operations should be minimized or avoided
when combined with animations.

## What does the hint check?

It scans the css properties inside @keyframes property against a defined
set of properties and associated rendering triggers.

### Examples that **trigger** the hint

`left` property triggers a `Layout` operation its use should be minimized inside
`@keyframes` to avoid jankiness or slow animations.

```css
@keyframes performance-with-layout-trigger {
    0% {
        left: 0;

    }
    100% {
        left: 400px;
    }
}
```

### Examples that **pass** the hint

A better approach is to use `translate` which will trigger only once, at the
end of the animation.

```css
@keyframes performance-without-layout-trigger {
    0% {
        transform: translateX(0);

    }
    100% {
        transform: translateX(400px);
    }
}
```

## Can the hint be configured?

You can decide the granularity and severity of your reports up to the
following categories:

- detect-css-reflows/composite
- detect-css-reflows/layout
- detect-css-reflows/paint

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
        "detect-css-reflows/composite": "off",
        "detect-css-reflows/layout": "hint",
        "detect-css-reflows/paint": "off"
    },
    ...
}
```

## Further Reading

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[understanding-critical-path]: https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path
