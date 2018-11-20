# TypeScript import helpers (`import-helpers`)

`typescript-config/import-helpers` checks if the property `importHelpers`
is enabled in your TypeScript configuration file (i.e. `tsconfig.json`) and
that the [`tslib` package][tslib package] is installed.

## Why is this important?

By enabling the `importHelpers` compiler option of TypeScript, the compiler will
use the `tslib` package and reduce the size of the output. E.g.:

<!-- eslint-disable -->

```js
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.x = {};
exports.y = __assign({}, exports.x);
```

<!-- eslint-disable -->

```js
var tslib_1 = require("tslib");
exports.x = {};
exports.y = tslib_1.__assign({}, exports.x);
```

## What does the hint check?

This hint checks if the `compilerOptions` property `importHelpers` is enabled.

### Examples that **trigger** the hint

By default, TypeScript doesn't enable `importHelpers`:

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

Also setting the value to `false` will fail:

```json
{
    ...
    "compilerOptions": {
        "importHelpers": false,
        ...
    },
    ...
}
```

### Examples that **pass** the hint

`importHelpers` value is `true`:

```json
{
    "compilerOptions": {
        "importHelpers": true,
        ...
    },
    ...
}
```

## Further Reading

* [TypeScript Documentation][typescript docs]
* [tslib Documentation][tslib docs]

[tslib docs]: https://github.com/Microsoft/tslib
[tslib package]: https://www.npmjs.com/package/tslib
[typescript docs]: https://www.typescriptlang.org/docs/home.html
