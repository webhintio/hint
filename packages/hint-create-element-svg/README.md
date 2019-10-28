# No `createElement` with SVG (`create-element-svg`)

This hint informs users that they need to use [`createElementNS`][createElementNS]
to create SVG elements instead of [`createElement`][createElement].

## Why is this important?

SVG-in-HTML is a fantastic addition to the web platform, but since SVG
is an XML-based language there is some nuance to how it can be used.
When parsing HTML, SVG elements are automatically created correctly so
long as they are inside an `<svg>...</svg>` block. However, SVG elements
cannot be *dynamically* created using `createElement` in the same way
as HTML elements.

For example, calling `document.createElement('circle')` actually returns
an *HTML* element named `circle` instead of an SVG element. This is for
compatibility with existing web content which may have created custom
(although invalid) HTML elements using these same names.

In order to dynamically create SVG elements, you must explicitly tell the
browser you want SVG by using the [SVG namespace][svg namespace] with
`createElementNS`. For example, to create an SVG `circle` call
`document.createElementNS('http://www.w3.org/2000/svg', 'circle')`.

## What does the hint check?

This hint scans JavaScript source code to check if `createElement` is
called with any known SVG element names.

### Examples that **trigger** the hint

```javascript
const container = document.getElementById('container');
const svg = document.createElement('svg');

container.appendChild(svg);
```

### Examples that **pass** the hint

```javascript
const container = document.getElementById('container');
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

container.appendChild(svg);
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
        "create-element-svg": "error"
    },
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

[Document.createElementNS][createElementNS vs createElement]
[SVG: Scalable Vector Graphics][svg]

<!-- Link labels: -->

[createElement]: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
[createElementNS]: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS
[createElementNS vs createElement]: http://zhangwenli.com/blog/2017/07/26/createelementns/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[svg]: https://developer.mozilla.org/en-US/docs/Web/SVG
[svg namespace]: https://www.w3.org/2000/svg
