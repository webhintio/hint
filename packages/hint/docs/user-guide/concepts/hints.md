# Hints

A `hint` is a test that your website needs to pass. `webhint` comes with
a few [built in ones](../hints/), but you can create your own or download
them from `npm`. You can read more about [how to create hints in the
contributor guide](../../contributor-guide/hints/index.md).

## Hint configuration

When using `webhint`, you are always in control. This means that you can
decide what hints are relevant to your use case and what severity a hint
should have:

* `off`: The hint will not be executed. This is the same as not having
  the hint under the `hints` section of a `.hintrc` file.
* `warning`: The hint will be executed but it will not change the exit
  status code if an issue is found.
* `error`: The hint will be executed and will change the exit status
  code to `1` if an issue is found.

Hints can be configured using the array or object syntax:

```json
{
    "hints": [
        "hint1:warning"
    ]
}
```

```json
{
    "hints": {
        "hint1": "warning"
    }
}
```

The `off` and `warning` hint severities may be applied with shorthand
characters `-` and `?` respectfully when using the array syntax:

A hint that has the `off` severity applied:

```json
"hints": [
    "-hint1"
]
```

A hint that has the `warning` severity applied:

```json
"hints": [
    "?hint1"
]
```

Additionally, some hints allow further customization. The configuration
in that case it will be similar to the following:

```json
"hints": [
    ["hint1:warning", {
        "customization1": "value1",
        "customization2": "value2"
    }]
]
```

or

```json
"hints": [
    {
       "hint1": ["warning", {
         "customization1": "value1",
         "customization2": "value2"
       }]
    }
]
```

You can check which hints accept this kind of configuration by
visiting the [hints documentation](../hints/).
