# webhint extension for Visual Studio Code

Use `webhint` to improve your website - during development.

This extension runs and reports diagnostics for workspace files based on
`webhint` analysis.

## Prerequisites

This extension requires a local or global install of `webhint` to run.

Run `npm install hint --save-dev` to add `webhint` to your project.
Or run `npm install -g hint` to install `webhint` globally.

## Configuration

This extension uses your local `.hintrc` file to configure `webhint`.
If no `.hintrc` file is found it defaults to `@hint/configuration-development`.

To create one, run `npm init hintrc` to and choose `development` as the
configuration to extend.

## Help

Learn more about webhint at [webhint.io](https://webhint.io).
For help with output from specific hints, see the
[webhint user guide](https://webhint.io/docs/user-guide/hints/).
