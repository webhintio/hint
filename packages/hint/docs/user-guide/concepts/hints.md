---
date: 08/20/2020
---
# Hints

A hint is a test that your website needs to pass.  Webhint comes with several [built-in hints][HintsIndex], but you may create your own or download more hints from `npm`.  For more information more about how to create hints, go to [contributor guide][ContributorGuideHowToHint].

## Installing hints

Complete the following actions to utilize a hint.

1.  Install any package matching `@hint/hint-`, `webhint-hint-`, or `@scope/webhint-hint-`.
1.  Add the name of that package to the `hints` array or object in your `.hintrc` file.

    > [!NOTE]
    > Packages within the `@hint/` namespace, such as `@hint/hint-html-checker`, may be added using a short name.

As an example, use the following actions to use the [Nu HTML test][HintHtmlCheckerReadme] hint.

1.  Run the command in the following code snippet to install the [@hint/hint-html-checker][HintHtmlCheckerReadme] package:

    ```bash
    npm i -D @hint/hint-html-checker
    ```

1.  Copy the hint in the following code snippet and add it to your `.hintrc` file.

    ```json
    {
        "hints": [
            "html-checker:error"
        ]
    }
    ```

As another example, use the following actions to use a hint from a developer outside of the hint namespace.

> [!NOTE]
> You must use the full name of the package if it is not included in the hint namespace.

1.  Run the command in the following code snippet to add the `@myOrg/webhint-hint-clever-custom-audit` and `webhint-hint-another-example1` hints to your `package.json` file.

```bash
npm -i -D @myOrg/webhint-hint-clever-custom-audit webhint-hint-another-example1
```

1.  Copy the hints in the following code snippet and add it to your `.hintrc` file.

```json
{
    "hints": [
        "@myOrg/webhint-hint-clever-custom-audit",
        "webhint-hint-another-example1"
    ]
}
```

## Hint configuration

When you use the `hint` CLI, you are always in control.  This means that you decide which hints are relevant to your use-case, as well, as what `severity` a hint should have.


| `Severity` value | Details |
|:--- |:--- |
| `off` | The `hint` is not run.  The same as deleting the `hint` from the `.hintrc`. |
| `error` | If the `hint` finds a major issue that affects one or more targeted browsers and you should fix immediately. |
| `warning` | If the `hint` finds an issue that you should investigate and fix.  The issue may not cause problems in practice. |
| `hint` | If the the `hint` finds a minor issue, such as something to fix that may cause problems in the future. |
| `information` | The `hint` provides information that is relevant to the you.  The information may help with other parts of a feature. |

You configure hints with the array or object syntax.

The following code snippets use an npm package named `@hint/hint-example1`.

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

You may use the following character in place of the associated `severity`.

| severity | short-hand character |
|:--- |:--- |
| `off` | `-` |
| `warning` | `?` |

A The following code snippet displays a hint with the `off` severity.

```json
{
    "hints": [
        "-example1"
    ]
}
```

A The following code snippet displays a hint with the `warning` severity.

```json
{
    "hints": [
        "?example1"
    ]
}
```

Some hints enable further customization.  The configuration with further customization should be similar to the following code snippets.

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

For more information about which hints accept the customized kind of configuration, go to [Hints categories][HintsIndex].

<!-- Link labels: -->

[HintsIndex]: ../hints/index.md "Hints categories | webhint"
[ContributorGuideHowToHint]: ../../contributor-guide/how-to/hint.md "Develop a hint | webhint"
[HintHtmlCheckerReadme]: ../../../../hint-html-checker/README.md "Nu HTML test (`html-checker`) | webhint"
