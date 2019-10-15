# scoped-svg-styles (`@hint/hint-scoped-svg-styles`)

Scoped SVG Styles checks if SVG styles affect any other elements outside the svg.

## Why is this important?

As `<style>` inside inline `<svg>` elements are not scoped to `<svg>`,
these can affect elements of dom outside the SVG. So it is important to
detect if any style (CSS rule or selector) inside `<svg>` selects
elements outside it.

## What does the hint check?

This hint checks if styles inside SVG affect any other elements outside
it. If any such style is found, it reports the CSS rule that is
affecting and html elements that are being affected.

### Examples that **trigger** the hint

Any style rule inside SVG that selects elements outside it will trigger
the hint.

Example:

```html
<html>
    <body>
        <h1 class="my-style">Heading</h1>

        <svg>
            <style>
                .my-style {
                    opacity: 0.5;
                }
            </style>
            <text class="my-style">SVG text</text>
        </svg>
    </body>
</html>
```

### Examples that **pass** the hint

If in document, all styles inside SVGs are scoped to SVG only and are
not affecting any element outside it, hint will pass.

Example:

```html
<html>
    <body>
        <h1 class="html-style">Heading</h1>

        <svg>
            <style>
                .svg-style {
                    opacity: 0.5;
                }
            </style>
            <text class="svg-style">SVG text</text>
        </svg>
    </body>
</html>
```

## Can the hint be configured?

This hint can be configured to limit the number of HTML elements reported
per CSS rule. If the hint finds an affecting CSS rule, it generates one report
related to that rule and an additional report for each HTML element
matched by that rule.

If the `maxReportsPerCSSRule` option is passed to this hint, it will limit the
number of reports related to affected elements, but reports related to the
CSS rule will still be there.

### How to pass `maxReportsPerCSSRule` option to hint

`maxReportsPerCSSRule` can be added in `.hintrc` as given below:

```json
    ...
    "hints": {
            "scoped-svg-styles": [
                    "warning", {
                        "maxReportsPerCSSRule": 5
                    }
            ]
        },
    ...
```

In above example, for every affecting rule, there can be a maximum of six
reports. One report related to the CSS rule itself and a maximum of
five reports related to affected elements.

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
        "scoped-svg-styles": "error"
    },
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
