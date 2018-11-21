# Valid TypeScript configuration (`is-valid`)

## Why is this important?

If you are building an app or a website using TypeScript, you
need to be sure the configuration file is valid.

### What does the hint check?

This hint checks if the TypeScript configuration is valid.
To do this we are using the
[tsconfig schema][typescript schema] but adding the property
`"additionalProperties": false,` to the options `compilerOptions`
and `typeAcquisition`.

### Examples that **trigger** the hint

The `compileOptions` has an invalid property:

```json
{
    "compilerOptions": {
        "invalidProperty": true,
        ...
    },
    ...
}
```

A property has an invalid value:

```json
{
    "compilerOptions": {
        "target": "esnext2",
        ...
    },
    ...
}
```

### Examples that **pass** the hint

The configuration is valid:

```json
{
    "compilerOptions": {
        "target": "esnext",
        ...
    },
    ...
}
```

## Further Reading

* [TypeScript Documentation][typescript docs]

[typescript docs]: https://www.typescriptlang.org/docs/home.html
[typescript schema]: http://json.schemastore.org/tsconfig
