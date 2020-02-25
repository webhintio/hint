# Vue (`@hint/parser-vue`)

The `Vue` parser is built so hints can analyze `Vue` files.

This package is installed automatically by webhint:

```bash
npm install hint --save-dev
```

To use it, activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        ...
    },
    "parsers": ["vue"],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Events emitted

This `parser` emits the following events:

* `parse::start::vue` of type `Event` which contains the following information:

  * `resource`: the resource we are going to parse.

* `parse::end::vue` of type `Event` which has the following information:

  * `resource`: the parsed resource.

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
