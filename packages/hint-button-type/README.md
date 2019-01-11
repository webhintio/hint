# button-type (`@hint/hint-button-type`)

Check if button has type attribute set

## Why is this important?

The default type for <button> is "submit" (not type="button" as one might expect). This can lead to surprising keyboard behavior within a form. 

The best way to avoid unexpected surprises is to always explicitly set a type on <button>s.

## What does the hint check?

This hint checks whether the type attribute of a button is explicitly set.

### Examples that **trigger** the hint

```
<button></button>
```

### Examples that **pass** the hint

<button type="submit"></button>
<button type="button"></button>

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-button-type
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
        "button-type": "error"
    },
    ...
}
```

## Further Reading

What can the user read to know more about this subject?

<!-- Link labels: -->


[http://lea.verou.me/2018/05/never-forget-typebutton-on-generated-buttons/](http://lea.verou.me/2018/05/never-forget-typebutton-on-generated-buttons/)
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
