# TypeScript consistent casing (`consistent-casing`)

`typescript-config/consistent-casing` checks if the property `forceConsistentCasingInFileNames`
is enabled in your TypeScript configuration file (i.e. `tsconfig.json`).

## Why is this important?

If you are working on a project where developers use different OSes (e.g.:
Windows and Linux), enabling this property will prevent issues related to
the file casing and how the files are referenced in the code.

## What does the hint check?

This hint checks if the `compilerOptions` property `forceConsistentCasingInFileNames`
is enabled.

### Examples that **trigger** the hint

By default, TypeScript doesn't enforce this:

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
        "forceConsistentCasingInFileNames": false,
        ...
    },
    ...
}
```

### Examples that **pass** the hint

`forceConsistentCasingInFileNames` value is `true`:

```json
{
    "compilerOptions": {
        "forceConsistentCasingInFileNames": true,
        ...
    },
    ...
}
```

## Further Reading

* [TypeScript Documentation][typescript docs]

[typescript docs]: https://www.typescriptlang.org/docs/home.html
