# Improper use of `for..of` and `for..in` loops

This hint informs users that they should to use [`for...of`][for-of]
loop with array-like objects and  [`for...in`][for-in] loop with objects
with enumerable properties.

## Why is this important?

The `for...in` statement iterates over all enumerable properties of
an object that are keyed by strings (ignoring ones keyed by Symbols),
including inherited enumerable properties.

The `for...of` statement creates a loop iterating over iterable objects,
including: built-in String, Array, array-like objects (e.g., arguments or
NodeList), TypedArray, Map, Set, and user-defined iterables. It invokes a
custom iteration hook with statements to be executed for the value of
each distinct property of the object.

## What does the hint check?

This hint scans JavaScript source code to check if the argument in
`for...in` is used with objects with enumerable properties and `for...of`
is used with array-like objects. In case of improper use of either loop,
it emits a error to help save time debugging this subtle issue.

### Examples that **trigger** the hint

```javascript
const list = ['a', 'b', 'c'];

for (const item in list) {
    if (list.hasOwnProperty(item)){
        console.log(item); // logs 0, 1, and 2
    }
}
```

```javascript
const obj = { a: 'one', b: 'two', c: 'three' };

for (const key of obj) { // throws an exception at runtime
    console.log(key);
}
```

### Examples that **pass** the hint

```javascript
const list = ['a', 'b', 'c'];

for (const item of list) {
    console.log(item); // logs 'a', 'b', and 'c'
}

const obj = { a: 'one', b: 'two', c: 'three' };

for (const key in obj) {
    if (obj.hasOwnProperty(key)){
        console.log(key); // logs 'a', 'b', and 'c'
    }
}
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

[`for...of` loop][for-of]
[`for...in` loop][for-in]

<!-- Link labels: -->

[for-of]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
[for-in]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
