---
date: 08/20/2020
---
# User guide

Whether this is you first time using with webhint or not, use the following content to help you build your webhint skills.

## Getting started

To start using learning about `webhint` doescomplet the folowing actions.

1.  Install [Node.js][NodejsDownloadCurrent] verions 10 or later, the x64 version is recommended.
1.  Run the command in the following code snippet.

    ```bash
    npx hint https://example.com
    ```

> [!Note]
> You may also run webhint from within [Visual Studio Code (VS Code)][UserGuideExtensionsVscodeWebhint] or as a [browser extension][UserGuideExtensionsBrowser].

To add webhint to your project, you should install the `devDependency`.

1.  To install the `devDependency`, run the command in the following code snippet.

    ```bash
    npm install hint --save-dev
    ```

1.  After you install the `devDependency`, copy the script task in the following code snippet and add it to your `package.json` file.

    ```json
    {
        ...
        "scripts": {
            "webhint": "hint http://localhost:8080"
        }
    }
    ```

1.  To start your webhint, run the command in the following code snippet.

    ```bash
    npm run webhint
    ```

> [!NOTE]
> If you run into any issues during the install process, see [Common issues when installing or running webhint][UserGuideTroubleshootSummary].

Use webhint to analyze local files or directories and get hints on different areas that are not available from a website.  For example,  hints related to JSX, `tsconfig.json`, and so on.

Depending on the target of your analysis, webhint uses one of the following configurations.

*   [web-recommended][UserGuideConfigurationsWebRecommended] if analyzing a website \(for example, target starts with `http://` or `https://`\).
*   [development][UserGuideConfigurationsDevelopment] if analyzing a local file or directory.

If you want to change the connector, hints, and so on, you may add a `.hintrc` file in the current directory.  To learn more about the format and the options, see [configuring webhint][UserGuideConfiguringWebhintSummary].

## Further reading

After you have `webhint` up and running, it is time to learn a bit more about the different pieces.

*   [Hints][UserGuideConceptsHints]
*   [Configurations][UserGuideConceptsConfigurations]
*   [Connectors][UserGuideConceptsConnectors]
*   [Formatters][UserGuideConceptsFormatters]
*   [Parsers][UserGuideConceptsParsers]

<!-- links -->

[UserGuideConceptsConfigurations]: ./concepts/configurations.md "Configurations | webhint"
[UserGuideConceptsConnectors]: ./concepts/connectors.md "Connectors | webhint"
[UserGuideConceptsFormatters]: ./concepts/formatters.md "Formatters | webhint"
[UserGuideConceptsHints]: ./concepts/hints.md "Hints | webhint"
[UserGuideConceptsParsers]: ./concepts/parsers.md "Parsers | webhint"
[UserGuideConfiguringWebhintSummary]: ./configuring-webhint/summary.md  "Configuring Webhint | webhint"
[UserGuideExtensionsBrowser]: ../../../extension-browser/README.md "Webhint Browser Extension EditSignal Issue | webhint"
[UserGuideConfigurationsDevelopment]: ./configurations/configuration-development.md "Webhint Development Configuration | webhint"
[UserGuideConfigurationsWebRecommended]: ./configurations/configuration-web-recommended.md "Webhint Recommended Web Configuration | webhint"
[UserGuideExtensionsVscodeWebhint]: ../../../extension-vscode/README.md "Webhint VS Code Extension | webhint"
[UserGuideTroubleshootSummary]: ./troubleshoot/summary.md "Common issues when installing or running webhint | webhint"

[NodejsDownloadCurrent]: https://nodejs.org/en/download/current "Downloads | Node.js"
