# Troubleshoot webhint installation and runtime issues

This topic contains the most common issues reported by users along with
potential fixes. If you encounter an undocumented error, please [open an
issue][GitHubWebhintioHintNew] on GitHub.

> **NOTE**: `webhint` is supported on the most recent LTS and Current version
> of Node.js. You should use the x64 version of webhint.

## Windows Subsystem Linux

If you choose to use Windows Subsystem Linux \(WSL\) to build your packages,
you may receive errors related to the following binary packages.

* `canvas`
* `iltorb`

You may receive an error similar to the following example.

```shell
Info looking for cached prebuild @ /home/mahome/.npm/_prebuilds/47fbee-iltorb-v2.4.3-node-v59-linux-x64.tar.gz
WARN install No prebuilt binaries found (target=9.10.0 runtime=node arch=x64 libc= platform=linux)
gyp ERR! build error
gyp ERR! stack Error: not found: make
```

To resolve this error, you must install the prerequisites of the packages.

> **IMPORTANT**: You should not use WSL to run `webhint` due to the dependency
> on Puppeteer.

To enable `webhint` to run on WSL, add the following code snippet to your
[.hintrc][UserGuideConfiguringWebhintSummary] file.

```json
{ "extends": ["web-recommended"], "connector": "jsdom" }
```

To run `webhint` with a configuration \(.hintrc\) file without installing it,
run the following command.

```bash
npx hint -c ./path/to/.hintrc https://example.com
```

## Building Windows packages

You may receive the following error depending on the settings of your
development environment or if there was a problem downloading any of the
pre-compiled native modules of webhint.

```shell
gyp ERR! stack Error: Can't find Python executable "python"
```

Recent versions of Node.js \(version 10 or later\) on Windows display a prompt
for you to install any required dependencies.

Alternatively, you may manually install the
[windows-build-tools][NpmjsPackageWindowsBuildTools].

1. In an **Elevated PowerShell** prompt, run the command in the following code
   snippet.

   ```powershell
   npm install --global windows-build-tools
   ```

## Issues with canvas

Starting with `connector-jsdom v1.1.0`, `canvas` is [now an optional
dependency][GithubWebhintioHint47d51aeaa187351267f7b4cabd3f075de49d043d].  You
may receive some issues during the installation if the binary is not available
for download, but the overall process should finish running and you should be
able to run `webhint` using the `jsdom` connector.  The only caveat is images
are not downloaded.

The following circumstances are more likely to cause errors.

* A new release of Node.js is available, but pre-compiled binaries for
  `canvas` are not yet available.
* You are running the x86 version of Node.js on Windows. To fix the error, you
  should switch to x64 since [x86 binaries may not be published any time soon][GithubNodeGfxCanvasPrebuilt27Commnet348037675].

If you want to compile canvas, go to
[Compiling][GithubAutomatticNodeCanvasCompiling].

## Permission issues during installation

If you receive an `EACCES` permission error while you install `webhint`, your
project may not have `webhint` installed as a `devDependency`.

1. To install `webhint` as a `devDependency` for your project, run the following
   command:

   ```bash
   npm install hint --save-dev
   ```

If you are not able to install `webhint` as a `devDependency`,
[change the default directory for npm][NpmjsDocsResolvingEaccesPermissionsErrorsInstallingPackagesGloballyChangeDefaultDirectory]
.  After changing the the default directory, try to install it again.

For more information about how to change the npm default directory, go to
[Manually change the npm default directory][NpmjsDocsResolvingEaccesPermissionsErrorsInstallingPackagesGloballyChangeDefaultDirectory]
.

According to [npm
documentation][NpmjsDocsDownloadingInstallingUsingVersionManager], if you have
Node.js installed using a package manager like [Homebrew][BrewMain] or
[nvm][GithubCreationixNvm], you may may not have to change the directories
because you have the correct default permissions.

<!-- links -->

[UserGuideConfiguringWebhintSummary]: ../configuring-webhint/summary.md "Configure webhint | webhint"

[BrewMain]: https://brew.sh "Homebrew"

[GithubAutomatticNodeCanvasCompiling]: https://github.com/Automattic/node-canvas#compiling "Compiling - node-canvas - Automattic/node-canvas | GitHub"

[GithubCreationixNvm]: https://github.com/creationix/nvm "Node Version Manager - nvm-sh/nvm | GitHub"

[GithubNodeGfxCanvasPrebuilt27Commnet348037675]: https://github.com/node-gfx/node-canvas-prebuilt/issues/27#issuecomment-348037675 "issuecomment-348037675 - Add node-v48-win32-ia32? - node-gfx/node-canvas-prebuilt | GitHub"

[GithubWebhintioHint308]: https://github.com/webhintio/hint/issues/308 "Can't install via npm - canvas error - webhintio/hint | GitHub"
[GithubWebhintioHint47d51aeaa187351267f7b4cabd3f075de49d043d]: https://github.com/webhintio/hint/commit/47d51aeaa187351267f7b4cabd3f075de49d043d "Fix: Make canvas optional - webhintio/hint | GitHub"
[GitHubWebhintioHintNew]: https://github.com/webhintio/hint/issues/new "New Issue - webhintio/hint | GitHub"

[NpmjsPackageIltorb]: https://www.npmjs.com/package/iltorb "iltorb | npm"
[NpmjsDocsResolvingEaccesPermissionsErrorsInstallingPackagesGloballyChangeDefaultDirectory]: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally#manually-change-npms-default-directory "Manually change npm`s default directory - Resolving EACCES permissions errors when installing packages globally | npm"
[NpmjsDocsDownloadingInstallingUsingVersionManager]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm "Using a Node version manager to install Node.js and npm - Downloading and installing Node.js and npm | npm"
[NpmjsPackageWindowsBuildTools]: https://www.npmjs.com/package/windows-build-tools "windows-build-tools | npm"
