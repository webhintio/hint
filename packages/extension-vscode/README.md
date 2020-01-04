# Webhint VS Code extension

Use `webhint` to improve your website - during development.

This extension runs and reports diagnostics for workspace files
based on `webhint` analysis.

![VS Code running the webhint extension][vscode gif]

## Configuration

This extension will use the [`@hint/configuration-development`][config]
configuration by default. This configuration activates hints and parsers
for HTML and templating systems (JSX/TSX, Angular, etc.),
JavaScript/TypeScript, common pitfalls, and more. Refer to the package
to learn more about what is enabled.

This should be a good starting point for everyone. If you encounter
any false positives please [open an issue in GitHub][issue github].

If you want more control over what gets activated, you can create a
local `.hintrc` file to configure `webhint`. Please read the
[user guide][] to know more about this file.

## Contributing to the extension

To contribute to the extension please read the [`CONTRIBUTING.md`][contributing]
file of the package.

## Help

Learn more about webhint at [webhint.io][site]. For help with output
from specific hints, see the [`webhint` user guide][hints].

<!-- Link labels: -->

[config]: https://github.com/webhintio/hint/blob/master/packages/configuration-development/index.json
[contributing]: https://github.com/webhintio/hint/blob/master/packages/extension-vscode/CONTRIBUTING.md
[hints]: https://webhint.io/docs/user-guide/hints/
[issue github]: https://github.com/webhintio/hint/issues/new?labels=type%3Abug&template=1-bug-report.md&title=%5BBug%5D+Bug+description
[site]: https://webhint.io
[user guide]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[vscode gif]: https://user-images.githubusercontent.com/606594/69293022-71d89d00-0bbc-11ea-96ef-f90daa4b1374.gif
