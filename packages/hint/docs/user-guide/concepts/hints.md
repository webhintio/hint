# Hints

A hint is a test that your website needs to pass. `webhint` includes several
[built-in hints][HintsIndex], but you may create your own or download more
hints from `npm`. For more information about how to create hints, go to the
[contributor guide][ContributorGuideHowToHint].

## Installing hints

Complete the following actions to utilize a hint.

1. Search for a `webhint` package that begins with one of the following
   statements.
    * `@hint/hint-`
    * `webhint-hint-`
    * `@scope/webhint-hint-`
1. Install your selected package.
1. Add the name of that package to the `hints` array or object in your
   `.hintrc` file.

   > [!NOTE] Packages within the `@hint/` namespace, such as
   > `@hint/hint-html-checker`, may be added using a short name. The short name
   > does not include the `webhint` package reserved text. Example
   > `@hint/hint-html-checker` is shortened to `html-checker`.

As an example, use the following actions to use the [Nu HTML
test][HintHtmlCheckerReadme] hint.

1. To install the [@hint/hint-html-checker][HintHtmlCheckerReadme] package,
   run the following command.

   ```bash
   npm i -D @hint/hint-html-checker
   ```

1. Copy the hint in the following code snippet and add it to your `.hintrc`
   file.

   ```json
   {
       "hints": [
           "html-checker:error"
       ]
   }
   ```

> **NOTE**:  For convenience, the previous code snippet uses the short name to
> refer to the hint package name.

The following example teaches you on how to use custom hints. To refer to
custom hints, you must use the full package name. To use custom hints,
perform the following steps.

1. To add the `@myOrg/webhint-hint-clever-custom-audit` and
   `webhint-hint-another-example1` hints to your `package.json` file, run the
   following command.

   ```bash
   npm -i -D @myOrg/webhint-hint-clever-custom-audit webhint-hint-another-example1
   ```

1. Copy the hints in the following code snippet and add it to your `.hintrc`
   file.

   ```json
   {
       "hints": [
           "@myOrg/webhint-hint-clever-custom-audit",
           "webhint-hint-another-example1"
       ]
   }
   ```

## Hint configuration

When you run `webhint` from the command-line interface, you are always in
control and you decide which hints are relevant to your use-case. You also
specify what `severity` a hint should have. The following table describes the
allowed `severity` ratings.

| `Severity` value | Details |
|:--- |:--- |
| `off` | The `hint` is not run. The same as deleting the `hint` from the `.hintrc`. |
| `error` | If the `hint` finds a major issue that affects one or more targeted browsers. The specified content is broken and you should fix immediately. |
| `warning` | If the `hint` finds an issue. The specified content is a problem that you should investigate and fix. The issue may not cause problems in practice. |
| `hint` | If the `hint` finds a minor issue, such as something to fix. The specified content should be tracked and may cause problems in the future. The issue does not cause problems, but may become a `warning` in the future. |
| `information` | The `hint` provides information. The specified content is highlighted since it is relevant to you.  The information may help identify parts of a feature or provide instances of a feature for tracking. |

You may configure hints using either the array or object syntax.

The following code snippets display how to use the array and object syntax with
the `@hint/hint-example1` npm package.

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

You may use the following characters in place of the associated `severity`.

| severity | short-hand character |
|:--- |:--- |
| `off` | `-` |
| `warning` | `?` |

The following code snippet displays how to configure the hint and set the
severity to `off` using the short-hand character.

```json
{
    "hints": [
        "-example1"
    ]
}
```

Some hints enable further customization. The configuration with further
customization should be similar to the following code snippets.

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

For more information about which hints accept customized configurations, go to
[Hints categories][HintsIndex].

<!-- links  -->

[HintsIndex]: ../hints/index.md "Hints categories | webhint"
[ContributorGuideHowToHint]: ../../contributor-guide/how-to/hint.md "Develop a hint | webhint"
[HintHtmlCheckerReadme]: ../../../../hint-html-checker/README.md "Nu HTML test (`html-checker`) | webhint"
