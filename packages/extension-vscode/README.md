# VS Code

Use `webhint` to improve your website - during development.

This extension runs and reports diagnostics for workspace files
based on `webhint` analysis.

![VS Code running the webhint extension][vscode gif]

The extension is still in beta, please check the
[troubleshooting section][troubleshoot] and if you cannot find an
answer [open an issue in GitHub][issue github].

## Configuration

This extension uses your local `.hintrc` file to configure `webhint`.
If no `.hintrc` file is found it defaults to
[`@hint/configuration-development`][config].

To create one, run `npm create hintrc` and choose `development` as the
configuration to extend.

## Help

Learn more about webhint at [webhint.io][site]. For help with output
from specific hints, see the [`webhint` user guide][hints].

<!-- Link labels: -->

[config]: https://github.com/webhintio/hint/blob/master/packages/configuration-development/index.json
[hints]: https://webhint.io/docs/user-guide/hints/
[issue github]: https://github.com/webhintio/hint/issues/new?labels=type%3Abug&template=1-bug-report.md&title=%5BBug%5D+Bug+description
[site]: https://webhint.io
[troubleshoot]: https://webhint.io/docs/user-guide/troubleshoot/summary/
[vscode gif]: https://cdn-images-1.medium.com/max/1600/1*EsZ7KfkkmpEBgUrpSTMsZw.gif
