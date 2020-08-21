---
date: 08/20/2020
---
# Configure webhint

Use one of the following actions to configure `webhint`.

*   Use a `.hintrc` file.
*   Add a `hintConfig` property in your `package.json` file.

## Create a .hintrc file

To create a basic `.hintrc` file, use the command in the following code snippet.

```bash
npm create hintrc
```

If `webhint` is not able to find a valid configuration, it uses a default one and warns you about it.

![webhint default configuration warning](images/default-config.png)

In both cases, the format used is the same.  The following is an example for a `.hintrc` file.

```json
{
    "connector": {
        "name": "connectorName"
    },
    "formatters": ["formatterName"],
    "parsers": ["parserName"],
    "hints": {
        "hint1": "error",
        "hint2": "warning",
        "hint3": "off"
    },
    "hintsTimeout": 120000
}
```

## Add a hintConfig property in your package.json file

The following is an example for a `package.json` file.

```json
{
    "name": "project name",
    "dependencies": {
        ...
    },
    "scripts": {
        ...
    },
    ...
    "hintConfig": {
        "connector": {
            "name": "connectorName"
        },
        "formatters": ["formatterName"],
        "parsers": ["parserName"],
        "hints": {
            "hint1": "error",
            "hint2": "warning",
            "hint3": "off"
        },
        "hintsTimeout": 120000
    }
}
```

You are able to configure the following hint configuration properties.

| `hintConfig` key | Details |
|:--- |:--- |
| `connector` | How to access the resources. |
| `formatters` | How to output the results.  Multiple instances may exist. |
| `parsers` | How to handle special files such as stylesheets, JavaScript, manifest, and so on.  Multiple instances may exist. |
| `hints` | What to test for and the `severity` it should have.  Multiple instances may exist. |

The `severity` value of a `hint` may be set to one of the following values.

| `Severity` value | Details |
|:--- |:--- |
| `off` | The `hint` is not run.  The same as deleting the `hint` from the `.hintrc`. |
| `error` | If the `hint` finds a major issue that affects one or more targeted browsers and you should fix immediately. |
| `warning` | If the `hint` finds an issue that you should investigate and fix.  The issue may not cause problems in practice. |
| `hint` | If the the `hint` finds a minor issue, such as something to fix that may cause problems in the future. |
| `information` | The `hint` provides information that is relevant to the you.  The information may help with other parts of a feature. |

`webhint` allows you to configure it in many different ways.

The following topics provide additional information about configuring `webhint`.

*    [Browser configuration][UserGuideConfiguringWebhintBrowserConfiguration]
*    [Ignoring domains][UserGuideConfiguringWebhintIgnoringDomains]
*    [Hints timeout][UserGuideConfiguringWebhintHintsTimeout]
*    [Using relative resources][UserGuideConfiguringWebhintUsingRelativeResources]
*    [Website authentication][UserGuideConfiguringWebhintWebsiteAuthentication]

## Setting options using environment variables

It is possible to set webhint options using environment variables.  To do so, you must create a variable prefixed with `webhint_` and each "word" is another property that is separated by and underscore \(`_`\) character.  The following code snippet is an environment variable.

```text
"webhint_connector_options_waitFor" = "60000"
```

The following code snippet is the transformed key:value pair that is merged with your `.hintrc` file.

```json
{
    "connector": {
        "options": {
            "waitFor": 60000
        }
    }
}
```

> [!IMPORTANT]
> If a key already exists in `.hintrc` file, the key in the file takes precedence and the environment variable is ignored.

An good example of when you would use environment variables is when you are providing credentials, so the values are not stored in a file.

<!-- links -->

[UserGuideConfiguringWebhintBrowserConfiguration]: ./browser-context.md "Browser configuration | webhint"
[UserGuideConfiguringWebhintIgnoringDomains]: ./ignoring-domains.md "Ignoring domains | webhint"
[UserGuideConfiguringWebhintHintsTimeout]: ./rules-timeout.md "Hints timeout | webhint"
[UserGuideConfiguringWebhintUsingRelativeResources]: ./using-relative-resources.md "Using relative resources | webhint"
[UserGuideConfiguringWebhintWebsiteAuthentication]: ./website-authentication.md "Website authentication | webhint"
