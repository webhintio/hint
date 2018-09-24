# Contributing

Instructions for getting started contributing to `webhint`
for Visual Studio Code.

## Compile and Run

* Run `yarn` to install dependencies.
* Run `yarn build` from the root `hint` directory.
* Open VS Code on this directory.
* Switch to the Debug viewlet.
* Select `Client + Server` from the drop down.
* Run the launch config.

## Running Tests

* Run `yarn test` from this directory.

## Packaging

* Install the packager via `npm install -g vsce`.
* Run `npm install` from this directory (cannot package `yarn` install).
* Run `vsce package`.
* Install the generated `*.vsix` package in VSCode:
  * Go to `View > Extensions`.
  * Click `...` in the top-right of the panel.
  * Click `Install from VSIX...`.
  * Choose the generated `*.vsix` package from disk.

## Publishing

Full instructions available at the [Publishing Extensions][publishing]
page in the Visual Studio Code documentation. You must be a member of
the [`webhint` Azure DevOps organization][webhint org] to publish.

* Install the packager via `npm install -g vsce`
* Run `npm install` from this directory (cannot publish `yarn` install)
* Run `vsce login webhint`
* Provide your [Personal Access Token][token]
* Run `vsce publish` from this directory

Note `vsce` saves your login information so only `npm install` and
`vsce publish` are necessary on subsequent attempts.

<!-- Link labels: -->

[publishing]: https://code.visualstudio.com/docs/extensions/publish-extension
[webhint org]: https://webhint.visualstudio.com/
[token]: https://code.visualstudio.com/docs/extensions/publish-extension#_get-a-personal-access-token
