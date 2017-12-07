# Rules

A `rule` is a test that your website needs to pass. `sonarwhal` comes with
a few [built in ones](../rules/), but you can create your own or download
them from `npm`. You can read more about [how to create rules in the
contributor guide](../../contributor-guide/rules/index.md).

## Rule configuration

When using `sonarwhal`, you are always in control. This means that you can
decide what rules are relevant to your use case and what severity a rule
should have:

* `off`: The rule will not be executed. This is the same as not having
  the rule under the `rules` section of a `.sonarwhalrc` file.
* `warning`: The rule will be executed but it will not change the exit
  status code if an issue is found.
* `error`: The rule will be executed and will change the exit status
  code to `1` if an issue is found.

Rules can be configured using the array or object syntax:

```json
{
    "rules": [
        "rule1:warning"
    ]
}
```

```json
{
    "rules": {
        "rule1": "warning"
    }
}
```

The `off` and `warning` rule severities may be applied with shorthand
characters `-` and `?` respectfully when using the array syntax:

A rule that has the `off` severity applied:

```json
"rules": [
    "-rule1"
]
```

A rule that has the `warning` severity applied:

```json
"rules": [
    "?rule1"
]
```

Additionally, some rules allow further customization. The configuration
in that case it will be similar to the following:

```json
"rules": [
    ["rule1:warning", {
        "customization1": "value1",
        "customization2": "value2"
    }]
]
```

or

```json
"rules": [
    {
       "rule1": ["warning", {
         "customization1": "value1",
         "customization2": "value2"
       }]
    }
]
```

You can check which rules accept this kind of configuration by
visiting the [rules documentation](../rules/).
