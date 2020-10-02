# Leading '.' in `classList.add` or `classList.remove`

This hint informs users that they should to use
[`Element.classList`][classList] argument without a leading '.' as it
may lead to unintended results.

## Why is this important?

The [`Element.classList`][classList] is a read-only property that returns
a live DOMTokenList collection of the class attributes of the element.
This can then be used to manipulate the class list.

Using classList is a convenient alternative to accessing an element's list
of classes as a space-delimited string via element.className.

For example, calling `elementNodeReference.classList` actually returns
a DOMTokenList representing the contents of the element's class attribute.
If the class attribute is not set or empty, it returns an empty
DOMTokenList, i.e. a DOMTokenList with the length property equal to 0.

The DOMTokenList itself is read-only, although you can modify it using the
`add()` and `remove()` methods.

## What does the hint check?

This hint scans JavaScript source code to check if the argument in
`element.classList.add` or `element.classList.remove` is contains a
leading '.'.

### Examples that **trigger** the hint

```javascript
const element = document.getElementById('foo');

element.classList.add('.foo');
element.classList.remove('.foo');
```

### Examples that **pass** the hint

```javascript
const element = document.getElementById('foo');

element.classList.add('foo');
element.classList.remove('foo');
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
        "classlist-pitfall": "warning"
    },
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

[Element.classList][classList]

<!-- Link labels: -->

[classList]: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
