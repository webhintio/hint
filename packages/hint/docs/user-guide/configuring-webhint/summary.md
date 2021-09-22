# Configure webhint in your project

`webhint` enables you to specify the following options for a report.

* The `severity` of each hint.
* The output type of the report.
* The custom hints to include in a report.

There are 3 ways that to configure a  `webhint` report for your project.

* Use a `.hintrc` file in your project.
* Add a `hintConfig` property in your `package.json` file.
* Use an environmental variable to set a property in your `.hintrc` file that
    is used by all of your projects.

The 3 configuration methods require you to add the same code to different
locations. The code that you add to the locations include key:value pairs of
hint configuration properties, which are defined in the following table.

| Hint configuration key | Details |
|:--- |:--- |
| `connector` | How to access the resources. |
| `formatters` | How to output the results. Multiple instances may exist. |
| `parsers` | How to handle special files such as stylesheets, JavaScript, manifest, and so on.  Multiple instances may exist. |
| `hints` | What to test for and the [severity][UserGuideConceptsHintsHintConfiguration] it should have. Multiple instances may exist. |

For additional information about `severity` and hint configurations, go to
[Hint configuration][UserGuideConceptsHintsHintConfiguration].

## Create a .hintrc file

To create a basic `.hintrc` file, run the following command.

```bash
npm create hintrc
```

If `webhint` does not find a valid configuration \(`.hintrc` file or
`hintConfig` property in your `package.json`\), it uses a default one and warns
you about it.

```shell
Couldn't find any valid configurations
Running hint with the default configuration.
Learn more about how to create your own configuration at:
https://webhint.io/docs/user-guide/
```

The following code snippet is an example of a `.hintrc` file.

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

The following code snippet is an example of the json added to a `package.json`
file that uses webhint.

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

The following topics provide additional information about configuring
`webhint`.

* [Browser configuration][UserGuideConfiguringWebhintBrowserConfiguration]
* [Ignoring domains][UserGuideConfiguringWebhintIgnoringDomains]
* [Hints timeout][UserGuideConfiguringWebhintHintsTimeout]
* [Using relative resources][UserGuideConfiguringWebhintUsingRelativeResources]
* [Website authentication][UserGuideConfiguringWebhintWebsiteAuthentication]

## Setting properties using environment variables

> **NOTE**:  Any value added using an environmental variable is ignored if the
> key exists in the `.hintrc` file.

You may set `webhint` properties using environment variables. For example, you
may use an environment variable to store a key:value pair, such as credentials,
instead of saving it in a file.

To use an environment variable to set a `webhint` property, create a variable
prefixed with `webhint_` followed by a property name.  If the property is
nested under, use an underscore \(`_`\) character to separate each property
name.

For example, the following pseudocode represents an environment variable for a
`webhint` property.

```text
"webhint_connector_options_waitFor" = "60000"
```

The following code snippet represents the `webhint` property if it was added
directly to a `.hintrc` file.

```json
{
    "connector": {
        "options": {
            "waitFor": 60000
        }
    }
}
```

> **NOTE**: If a key already exists in the `.hintrc` file, the key in the
> .hintrc file is used and the environmental variable is ignored.

<!-- links -->

[UserGuideConfiguringWebhintBrowserConfiguration]: ./browser-context.md "Browser configuration | webhint"
[UserGuideConfiguringWebhintIgnoringDomains]: ./ignoring-domains.md "Ignoring domains | webhint"
[UserGuideConfiguringWebhintHintsTimeout]: ./rules-timeout.md "Hints timeout | webhint"
[UserGuideConfiguringWebhintUsingRelativeResources]: ./using-relative-resources.md "Using relative resources | webhint"
[UserGuideConfiguringWebhintWebsiteAuthentication]: ./website-authentication.md "Website authentication | webhint"
[UserGuideConceptsHintsHintConfiguration]: ../concepts/hints.md#hint-configuration "Hint configuration - Hints | webhint"
