# Contributing

Instructions for getting started contributing to `webhint` for Visual
Studio Code.

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
* Run `npm install` on this folder (cannot package `yarn` install).
* Run `vsce package`
* Install the generated `*.vsix` package in VSCode
  * Go to `View > Extensions`
  * Click `...` in the top-right of the panel
  * Click `Install from VSIX...`
  * Choose the generated `*.vsix` package from disk
