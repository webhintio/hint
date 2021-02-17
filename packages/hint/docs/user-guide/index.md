# Get started using webhint

Excited to start using `webhint`? Let's dig in!

To get the most out of this guide, you should be familiar with the
command-line tools on your machine, [Node.js][NodejsAbout], and the Node
Package Manager \([npm][NpmjsAbout]\).

The examples provided on webhint.io are written with the `bash` command-line
shell. For more information about `bash`, go to
[Bash Guide for Beginners][TldpLdpBashBeginnersGuide].

To verify that you have Node.js (version 10 or later) and `npm` installed, open
a `bash` command-line interface and run the following command:

```bash
node -v && npm -v
```

## Use webhint on websites or local files

To get started using `webhint` to improve your site performance and learn about
best practices that may be applied to your site, complete the following steps.

1. Run the command in the following code snippet.  The following code snippet
   uses `npx` to run the `npm` package without installing it.

   ```bash
   npx hint https://example.com
   ```

   or

   ```bash
   npx hint ./path/to/my.html
   ```

1. After the `webhint` process completes, a summary is presented in the bash
   command-line interface with a link to a report file on your computer.
1. Navigate to the report file and open it. The report file outlines the
   hints and solutions to apply to your site.

The following configurations defines how you may use `webhint`.

| Configuration | Details |
|:--- |:--- |
| [development][UserGuideConfigurationsDevelopment] | Analyze a local file or directory to get hints on different file types that are not available on websites.  For example, you may want to review the hints that are related to JSX, `tsconfig.json`, and so on. |
| [web-recommended][UserGuideConfigurationsWebRecommended] | Analyze local files or directories before you publishing to your website using `http` or `https`. |

## Install webhint

1. To install `webhint` using the default configuration, run the following
   command.

```bash
npm install hint
```

To confirm that `webhint` is installed, run the following command.

```bash
hint -v
```

> **NOTE**:  If you run into any issues during the install process, go to
> [Common issues when installing or running webhint][UserGuideTroubleshootSummary].

## Advanced webhint configurations

### Use webhint in your project

To analyze the files in your project, add `webhint` to your project.

To add `webhint` to your project, you must install the `devDependency` and
update your `package.json` file.

1. To install the `devDependency`, run the command in the following code
   snippet.

   ```bash
   npm install hint --save-dev
   ```

   You have also use `i` in place of `install` and `-D` in place of
   `--save-dev`.

   ```bash
   npm i -D hint
   ```

1. After you install the `devDependency`, copy the script task in the
   following code snippet and add it to your `package.json` file.

   ```json
   {
       ...
       "scripts": {
           "webhint": "hint http://localhost:8080"
       }
   }
   ```

1. To start webhint, run the command in the following code snippet.

   ```bash
   npm run webhint
   ```

### Customize webhint in your project

A custom hint \(`.hintrc` file\) is useful when you want either of the
following actions.

* Ignore specific errors.
* Highlight or break for specific warnings.

To customize the analysis of your files, create a custom configuration.

To change the connector, hints, and so on, add a `.hintrc` file in the current
directory. For more information about the `.hintrc` file and options, go to
[configuring webhint][UserGuideConfiguringWebhintSummary].

To run `webhint` in you your project with a custom configuration.

1. [Add `webhint` to your project](#use-webhint-in-your-project).
1. Add a `.hintrc` file to your project directory.
1. Navigate to your project directory.
1. Run the command in the following code snippet.

   ```bash
   npm run webhint
   ```

### Use webhint with Microsoft Visual Studio Code

The **webhint Visual Studio Code extension** runs and reports `webhint`
diagnostic data for your workspace files inside Visual Studio Code.

For more information about the using `webhint` within Visual Studio Code, go to
[webhint Visual Studio Code extension][UserGuideExtensionsVscodeWebhint].

### Use webhint with your browser

The **webhint browser extension** provides a visual interface that allows you to
run and re-run site scans that test against multiple browsers and hint types
directly in DevTools inside your browser.  It is available for Google Chrome,
Microsoft Edge, Mozilla Firefox.

For more information about the using `webhint` within your browser, go to
[webhint browser extension][UserGuideExtensionsBrowser].

## Next Steps

* [Hints][UserGuideConceptsHints]
* [Configurations][UserGuideConceptsConfigurations]
* [Connectors][UserGuideConceptsConnectors]
* [Formatters][UserGuideConceptsFormatters]
* [Parsers][UserGuideConceptsParsers]

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

[NodejsAbout]: https://nodejs.org/en/about "About Node.js(r) | Node.js"
[NodejsDownloadCurrent]: https://nodejs.org/en/download/current "Downloads | Node.js"

[NpmjsAbout]: https://www.npmjs.com/about "About npm | npm"

[TldpLdpBashBeginnersGuide]: https://tldp.org/LDP/Bash-Beginners-Guide/html/Bash-Beginners-Guide.html "Bash Guide for Beginners | The Linux Documentation Project"
