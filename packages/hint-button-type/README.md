# Specify button type (`button-type`)

`button-type` checks if all buttons have a `type` attribute set.

## Why is this important?

The default type for `<button>` is `submit` (not `type="button"` as one might expect).
This can lead to surprising keyboard behavior within a form.

The best way to avoid unexpected surprises is to always explicitly
set a type on `<button>`s.

## What does the hint check?

This hint checks whether the `type` attribute of a `<button>` is explicitly set.

### Examples that **trigger** the hint

```html
<button></button>
```

### Examples that **pass** the hint

```html
<button type="submit"></button>
<button type="button"></button>
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
        "button-type": "error"
    },
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

What can the user read to know more about this subject?

* [Never forget type="button" on generated buttons!][generated-buttons] by Lea Verou.

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[generated-buttons]: https://lea.verou.me/2018/05/never-forget-typebutton-on-generated-buttons/
