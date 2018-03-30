# typescript-config (`@sonarwhal/rule-typescript-config`)

`typescript-config` contains rules to check if your TypeScript configuration
has the most recommended configuration.

## Why is this important?

If you are building an app or a website using TypeScript, you
need to be sure the configuration file is valid.

## How to use this rule?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-typescript-config
```

Note: You can make `npm` install it as a `devDependency` using the `--save-dev`
parameter, or to install it globally, you can use the `-g` parameter. For
other options see
[`npm`'s documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.sonarwhalrc`][sonarwhalrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": [...],
    "rules": {
        "typescript-config/is-valid": "error"
    },
    ...
}
```

## Rule: `is-valid` (`typescript-config/is-valid`)

### What does the rule check?

This rule checks if the TypeScript configuration is valid.
To do this we are using the
[tsconfig schema][typescript schema] but adding the property
`"additionalProperties": false,` to the options `compilerOptions`
and `typeAcquisition`.

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