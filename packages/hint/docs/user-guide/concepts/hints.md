# Hints

A hint is a test that your website needs to pass. Webhint comes with
several [built in ones][hints], but you can create your own or download
them from `npm`. You can read more about [how to create hints in the
contributor guide][how to hint].

## Installing hints

To utilize a hint, install any package matching `@hint/hint-`,
`webhint-hint-`, or `@scope/webhint-hint-`. Then, add that package's
name to your .hintrc's `hints` array or object. Packages within the
`@hint/` namespace (like, for example, `@hint/hint-html-checker`) can be
added using their short name.

For example, to use the [Nu HTML test][html-checker] first install its
package:

```bash
npm i -D @hint/hint-html-checker
```

Then, add `@hint/hint-html-checker` to your .hintrc.

```json
{
    "hints": [
        "html-checker:error"
    ]
}
```

To add a hint from a developer outside of the hint namespace, add it
using its full package name. If you ran the following to add hints to
your package.json…

```shell script
npm -i -D @myOrg/webhint-hint-clever-custom-audit webhint-hint-another-example1
```

…add them to your .hintrc like so:

```json
{
    "hints": [
        "@myOrg/webhint-hint-clever-custom-audit",
        "webhint-hint-another-example1"
    ]
}
```

## Hint configuration

When using the `hint` CLI, you are always in control. This means that
you can decide which hints are relevant to your use case, as well as
what severity a hint should have:

* `off`: The hint will not be executed. This is functionally the same as
  entirely removing the hint from your .hintrc's `hints` array or
  object.
* `warning`: The hint will be executed but it will not change the exit
  status code if an issue is found.
* `error`: The hint will be executed and will change the exit status
  code to `1` if an issue is found.

Hints can be configured using the array or object syntax. For example,
using an npm package called `@hint/hint-example1`:

```json
{
    "hints": [
        "example1:warning"
    ]
}
```

```json
{
    "hints": {
        "example1": "warning"
    }
}
```

The `off` and `warning` hint severities may be applied with shorthand
characters `-` and `?` respectfully when using the array syntax:

A hint that has the `off` severity applied:

```json
{
    "hints": [
        "-example1"
    ]
}
```

A hint that has the `warning` severity applied:

```json
{
    "hints": [
        "?example1"
    ]
}
```

Additionally, some hints allow further customization. The configuration
in that case it will be similar to the following:

```json
{
    "hints": [
        [
            "example1:warning",
            {
                "customization1": "value1",
                "customization2": "value2"
            }
        ]
    ]
}
```

or

```json
{
    "hints": [
        {
            "example1": [
                "warning",
                {
                    "customization1": "value1",
                    "customization2": "value2"
                }
            ]
        }
    ]
}
```

You can check which hints accept this kind of configuration by
visiting the [hints documentation][hints].

<!-- Link labels: -->

[hints]: ../hints/index.md
[how to hint]: ../../contributor-guide/how-to/hint.md
[html-checker]: https://webhint.io/docs/user-guide/hints/hint-html-checker/
