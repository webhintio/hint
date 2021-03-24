# Webhint Visual Studio Code extension

Use `webhint` to improve your website during development.

The **Webhint Visual Studio Code extension** provides diagnostic data for
workspace files based on `webhint` analysis.

![Visual Studio Code running the webhint Visual Studio Code extension][ImageVisualStudioCodeRunningWebhintExtension]

## Configuration

The extension uses the `@hint/configuration-development` configuration by
default.  The `@hint/configuration-development` configuration activates hints
and parsers for HTML and template-making systems \(JSX/TSX, Angular, and so
on\), JavaScript/TypeScript, common pitfalls, and more.  The
`@hint/configuration-development` configuration is defined in
[index.json][GithubWebhintioHintPackagesConfigurationDevelopmentIndexJson].

For more information about what is enabled, go to
[package][GithubWebhintioHintPackagesExtensionVscode] on GitHub.

To report any incorrect hints or unexpected responses, please [open a new
issue][GithubWebhintioHintIssuesNewTemplate] on GitHub.

If you want more control over what gets activated, create a local `.hintrc` file
to configure `webhint`.

For more information about the `.hintrc` file, go to
[Summary][WebhintDocsUserGuideConfiguringWebhintSummary].

## Contribute to the extension

To contribute to the extension, go to
[Contributing][GithubWebhintioHintPackagesExtensionVscodeContributing] on
GitHub.

## Help

For more information about `webhint`, go to [webhint.io][WebhintMain].  For
more information about the output from specific hints, go to
[Hints categories][WebhintDocsUserGuideHints].

<!-- image links -->

[ImageVisualStudioCodeRunningWebhintExtension]: https://user-images.githubusercontent.com/606594/69293022-71d89d00-0bbc-11ea-96ef-f90daa4b1374.gif "Visual Studio Code running the webhint extension"

<!-- links -->

[GithubWebhintioHintIssuesNewTemplate]: https://github.com/webhintio/hint/issues/new?labels=type%3Abug&template=1-bug-report.md&title=%5BBug%5D+Bug+description "New Issue - webhintio/hint | GitHub"
[GithubWebhintioHintPackagesConfigurationDevelopmentIndexJson]: https://github.com/webhintio/hint/blob/main/packages/configuration-development/index.json "index.json - webhintio/hint | GitHub"
[GithubWebhintioHintPackagesExtensionVscodeContributing]: https://github.com/webhintio/hint/blob/main/packages/extension-vscode/CONTRIBUTING.md "Contributing - webhintio/hint | GitHub"
[GithubWebhintioHintPackagesExtensionVscode]: https://github.com/webhintio/hint/blob/main/packages/extension-vscode "Webhint Visual Studio Code extension - webhintio/hint | GitHub"

[WebhintDocsUserGuideHints]: https://webhint.io/docs/user-guide/hints "Hints categories | webhint"
[WebhintDocsUserGuideConfiguringWebhintSummary]: https://webhint.io/docs/user-guide/configuring-webhint/summary "Configuring Webhint | webhint"
[WebhintMain]: https://webhint.io "webhint"
