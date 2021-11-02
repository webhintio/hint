# TypeScript remove comments (`no-comments`)

`typescript-config/no-comments` checks that the property `removeComments`
is enabled in your TypeScript configuration file (i.e. `tsconfig.json`).

**Note:** This hint is no longer enabled by default. Removing comments as
part of a separate minification step is recommended instead. See
[this webhint issue][no-comments issue] for more details.

## Why is this important?

Removing the comments will make your final JavaScript files smaller. If you
are delivering these files over the Internet, you want them to be a small as
possible.

## What does the hint check?

This hint checks if the `compilerOptions` property `removeComments` is enabled.

### Examples that **trigger** the hint

By default, TypeScript doesn't strip the comments:

```json
{
    ...
    "compilerOptions": {
        "target": "es5",
    },
    ...
}
```

Also setting the value to `false` will fail:

```json
{
    ...
    "compilerOptions": {
        "removeComments": false,
        ...
    },
    ...
}
```

### Examples that **pass** the hint

`removeComments` value is `true`:

```json
{
    "compilerOptions": {
        "removeComments": true,
        ...
    },
    ...
}
```

## Further Reading

* [TypeScript Documentation][typescript docs]

[typescript docs]: https://www.typescriptlang.org/docs/home.html
[no-comments issue]: https://github.com/webhintio/hint/issues/4839
