# TypeScript target (`target`)

`typescript-config/target` takes into account your `webhint`'s
`browserslist` configuration and warns you if your `target`
(`es3`, `es2015`, etc.) is appropriate.

## Why is this important?

Not having the right `ES` target can increase the size of your bundle. At the same
time, having an `ES` target that not all the browsers you care support can create
issues with your users.

## What does the hint check?

This hint checks if the `compilerOptions` property `target` is the appropriate based
on your `browserslist` configuration.

The matrix is as follows:

| Target | Chrome | Edge | Firefox | Internet<br>Explorer | Safari |
| ------ | ------ | ---- | ------- | -- | ------ |
|  ES3   |   ✔    |  ✔  |    ✔    | ✔ |    ✔   |
|  ES5   |   5    |  ✔  |   4     | 9 |    5    |
| ES2015 |   49   |  13  |   37    | ❌ |   10   |
| ES2016 |   57   |  14  |   52    | ❌ |  10.1  |
| ES2017 |   58   |  16  |   53    | ❌ |  10.1  |
| ESNext |        |      |         |   |        |

Browsers not in this list will be ignored if they are in your browserslist.

Keep in mind that this is an approximative list. I.E.: There are still features
of `ES2015` that haven't been implemented in all browsers, but the numbers
above should give you good support for the most common ones.

The following sites were used to create this table:

<!-- markdownlint-disable MD034-->

* http://kangax.github.io/compat-table/es5/
* http://kangax.github.io/compat-table/es6/
* http://kangax.github.io/compat-table/es2016plus/
* https://www.chromestatus.com/features#ES6
* http://2ality.com/2011/02/es5-shim-use-ecmascript-5-in-older.html
* https://www.chromestatus.com/features#ES6https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_2015_support_in_Mozilla

<!-- markdownlint-enable MD034-->

### Examples that **trigger** the hint

Having a `target` not supported by all your targeted browsers:

`tsconfig.json`:

```json
{
    ...
    "compilerOptions": {
        "target": "es5",
        ...
    },
    ...
}
```

`.hintrc`:

```json
{
    ...
    "browserslist": ["IE 8"]
    ...
}
```

Having a `target` that is lower than what all your browsers support:

`tsconfig.json`:

```json
{
    ...
    "compilerOptions": {
        "target": "es3",
        ...
    },
    ...
}
```

`.hintrc`:

```json
{
    ...
    "browserslist": ["Chrome 64", "Edge 16", "Firefox 60"]
    ...
}
```

### Examples that **pass** the hint

The right `target` for the right browsers:

`tsconfig.json`:

```json
{
    ...
    "compilerOptions": {
        "target": "es3",
        ...
    },
    ...
}
```

`.hintrc`:

```json
{
    ...
    "browserslist": ["IE 8"]
    ...
}
```

## Further Reading

* [TypeScript Documentation][typescript docs]
* [Browserslist][browserslist]

[typescript docs]: https://www.typescriptlang.org/docs/home.html
[browserslist]: https://github.com/ai/browserslist
