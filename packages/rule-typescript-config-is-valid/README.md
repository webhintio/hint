# typescript-config-is-valid (`typescript-config-is-valid`)

`typescript-config-is-valid` warns again providing an
invalid TypeScript configuration file (i.e. `tsconfig.json`).

## Why is this important?

If you are bilding an app or a website using TypeScript, you
need to be sure the configuration file is valid.

## What does the rule check?

This rule check if the typescript configuration is valid.
To do this we are using the
[tsconfig schema][typescript schema] with some minor
changes.

### Examples that **trigger** the rule

The `compileOptions` has an invalid property:

```json
{
    "compilerOptions": {
        "invalidProperty": true
    }
}
```

A property has an invalid value:

```json
{
    "compilerOptions": {
        "target": "esnext2"
    }
}
```

### Examples that **pass** the rule

The configuration is valid:

```json
{
    "compilerOptions": {
        "target": "esnext"
    }
}
```

## Further Reading

* [TypeScript Documentation][typescript docs]

[typescript schema]: http://json.schemastore.org/tsconfig
[typescript docs]: https://www.typescriptlang.org/docs/home.html