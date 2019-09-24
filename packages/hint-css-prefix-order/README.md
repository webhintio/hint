# Prefixed CSS first (`css-prefix-order`)

Ensure vendor-prefixed versions of a CSS property are listed before the
standardized, unprefixed version.

## Why is this important?

When multiple versions of the same CSS property are specified, the last
*supported* one will be used due to how browsers handle
[fallback values][css-fallback]. This means the [order matters][css-order]
when using both vendor-prefixed and unprefixed versions of the same
property. Specifically, the unprefixed version must be listed last to ensure
standardized behavior takes precedence.

## What does the hint check?

This hint examines CSS files looking for blocks containing both prefixed
and unprefixed CSS properties or values. The hint then verifies the last
listed version of a particular property in a block is unprefixed.

### Examples that **trigger** the hint

```css
appearance: none;
-moz-appearance: none;
-webkit-appearance: none;
```

```css
display: grid;
display: -ms-grid;
```

### Examples that **pass** the hint

```css
-moz-appearance: none;
-webkit-appearance: none;
appearance: none;
```

```css
display: -ms-grid;
display: grid;
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
    "parsers": [...],
    "hints": {
        "css-prefix-order": "error"
    },
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

<!-- Link labels: -->

[css-fallback]: https://www.w3.org/TR/css-2018/#partial
[css-order]: https://css-tricks.com/ordering-css3-properties/#article-header-id-0
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
