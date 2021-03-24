# Leading '.' in `classList.add` or `classList.remove`

This hint informs users that they should to use
[`Element.classList`][classlist] argument without a leading '.' as it
may lead to unintended results.

## Why is this important?

When writing selectors either in CSS or using DOM methods like
`querySelector`, class names are referred to using a leading '.',
e.g. `document.querySelector('.foo')`. However when modifying the
`classList` of an element the raw class name is expected to be used
instead, e.g. `element.classList.add('foo')`.

Unfortunately if a leading '.' is provided to the `classList` APIs
it will succeed without an error, treating the '.' as part of the
name itself. This typically causes selectors elsewhere in the code
to fail to match this element. Figuring out why can be tedious and
time-consuming until the typo has been found.

## What does the hint check?

This hint scans JavaScript source code to check if the argument in
`element.classList.add` or `element.classList.remove` contains a
leading '.'. If so it emits a warning to help save time debugging
this subtle issue.

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
        "leading-dot-classlist": "warning"
    },
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

[Element.classList][classlist]

<!-- Link labels: -->

[classlist]: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
