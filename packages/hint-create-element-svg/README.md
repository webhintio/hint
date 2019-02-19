# No `createElement` with SVG (`create-element-svg`)

This hint informs users that they need to use [`createElementNS`][createElementNS] to create SVG elements instead of [`createElement`][createElement]

## Why is this important?

XML documents may contain elements and attributes that are defined for and used by multiple softwares.
This helps with modularity and re-use. However, this also causes issues with accurate recognition, resulting in collisions.
The browser needs to be able to recognize the tags and attributes for what they are designed to represent, especially when 
the same element type and attribute name can be used elsewhere to represent something else.

The XML namespace helps standardize these naming constructs and provides other useful information about them.
For example, in case of SVG elements, using `createElement` to create a `circle` element will be
misinterpreted by the browser as an invalid HTML element with the `<circle>` tag. However, creating the
`circle` object using `createElementNS` along with the correct [SVG namespace][svg namespace] will help the
browser correctly interpret it as an SVG element.

## What does the hint check?

This hint scans the abstract syntax tree to check if any SVG objects are created using `createElement`

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

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-create-element-svg
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
        "create-element-svg": "error"
    },
    ...
}
```

## Further Reading

[Document.createElementNS: What's the difference and why we need it?][createElementNS vs createElement]
[SVG: Scalable Vector Graphics][svg]

<!-- Link labels: -->

[createElement]: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
[createElementNS]: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS
[createElementNS vs createElement]: http://zhangwenli.com/blog/2017/07/26/createelementns/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[svg]: https://developer.mozilla.org/en-US/docs/Web/SVG
[svg namespace]: https://www.w3.org/2000/svg
