# Contributing

Instructions for getting started contributing to `webhint`
for Visual Studio Code.

## Compile and Run

* Run `yarn` to install dependencies.
* Run `yarn build` from the root `hint` folder.
* Open VS Code on this folder.
* Switch to the Debug viewlet.
* Select `Client + Server` from the drop down.
* Run the launch config.

## Running Tests

* Run `yarn test` from this folder.

## Packaging

* Install the packager via `npm install -g vsce`.
* Run `npm install` from this folder (cannot package `yarn` install).
* Run `vsce package`.
* Install the generated `*.vsix` package in VSCode:
  * Go to `View > Extensions`.
  * Click `...` in the top-right of the panel.
  * Click `Install from VSIX...`.
  * Choose the generated `*.vsix` package from disk.

## Publishing

Full instructions available at the
[Publishing Extensions](https://code.visualstudio.com/docs/extensions/publish-extension)
page in the Visual Studio Code documentation. You must be a member of the
[`webhint` Azure DevOps organization](https://webhint.visualstudio.com/)
to publish.

* Install the packager via `npm install -g vsce`
* Run `npm install` from this folder (cannot publish `yarn` install).
* Run `vsce login webhint`
* Provide your [Personal Access Token](https://code.visualstudio.com/docs/extensions/publish-extension#_get-a-personal-access-token)
* Run `vsce publish` from this folder

Note `vsce` saves your login information so only `npm install` and
`vsce publish` are necessary on subsequent attempts.
