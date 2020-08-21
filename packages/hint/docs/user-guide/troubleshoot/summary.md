---
date: 08/20/2020
---
# Common issues when installing or running webhint

The team currently supports webhint on the latest 2 LTS and current branch.  While it is possible to run it on x86 version of Node.js, it is recommended to use the x64 version.  The reason is that the project still uses some binary packages that are more likely to have a pre-compiled x64 version available \( and no pre-complied x86 version\).  An available pre-compiled version avoids the requirement to compile it.

This topic contains the most commons issues reported by users along with potential fixes.  If you run into something that is not documented in this topic, please [open an issue in the hint repo][GitHubWebhintioHintNew].

## Windows Subsystem Linux

You may receive errors related to building packages on WSLD due to the project using the following binary packages.

*   `canvas`
*   `iltorb`

You may receive the error displayed in the following code snippet.

```shell
Info looking for cached prebuild @ /home/mahome/.npm/_prebuilds/47fbee-iltorb-v2.4.3-node-v59-linux-x64.tar.gz
WARN install No prebuilt binaries found (target=9.10.0 runtime=node arch=x64 libc= platform=linux)
gyp ERR! build error
gyp ERR! stack Error: not found: make
```

To solve the previous error, install the prerequisites of the packages listed in it.

*   /home/mahome/.npm/_prebuilds/47fbee-[iltorb][NpmjsPackageIltorb]-v2.4.3-node-v59-linux-x64.tar.gz

> [!IMPORTANT]
> You should not use WSL to run webhint due to the hard dependency on Puppeteer.

Add the following code snippet to your config file to enable your webhint to run under WSL.

```json
{ "extends": ["web-recommended"], "connector": "jsdom" }
```

Use the command in the following code snippet to pass the configuration to hint.

```bash
npx hint -c ./path/to/.hintrc https://example.com
```

## Building Windows packages

Depending on your environment and if there is a problem downloading any of the pre-compiled native modules, you may receive an error similar to the following code snippet.

```shell
gyp ERR! stack Error: Can't find Python executable "python"
```

Newer versions of Node.js \(version 10 or later\) on Windows should ask the user to automatically install the required dependencies.  You may use the automated method or manually install the [windows-build-tools][NpmjsPackageWindowsBuildTools].

In an **Elevated PowerShell** prompt, run the command in the following code snippet.

```powershell
npm install --global windows-build-tools
```

## Issues with canvas

Starting with `connector-jsdom v1.1.0`, `canvas` is [now an optional dependency][GithubWebhintioHint47d51aeaa187351267f7b4cabd3f075de49d043d].  You may receive some issues during the installation if the binary is not available for download, but the overall process should finish and you should be able to run `webhint` using the `jsdom` connector.  The only caveat is images are not downloaded.

The following circumstances are more likely to cause the error.

*   A new release of Node.js is available, but pre-compiled binaries for `canvas` are not yet available.
*   You are running the x86 version of Node.js on Windows.  To fix the error, you should switch to x64 since [x86 binaries may not be published any time soon][GithubNodeGfxCanvasPrebuilt27Commnet348037675].

If you want to compile it, go to [Compiling][GithubAutomatticNodeCanvasCompiling].

## Permission issues during installation

If you receive an `EACCES` permission error when installing `webhint`, the common cause is a global installation.

Use the command in the following code snippet to install `webhint` as a `devDependency` of your project.

```shell
npm install hint --save-dev
```

If you are not able to install `webhint` as a `devDependency`, [change the default directory for npm][NpmjsDocsResolvingEaccesPermissionsErrorsInstallingPackagesGloballyChangeDefaultDirectory] and try again.  An issue was reported that installing the `canvas` dependency throws an `EACCES` permission error.  The [permission issue][GithubWebhintioHint308] was resolved using the recommended solution.  For more information about how to change the npm default directory, go to [Manually change the npm default directory][NpmjsDocsResolvingEaccesPermissionsErrorsInstallingPackagesGloballyChangeDefaultDirectory].  According to [npm documentation][NpmjsDocsDownloadingInstallingUsingVersionManager], if you have Node.js installed using a package manager like [Homebrew][BrewMain] or [nvm][GithubCreationixNvm], you may be able to avoid the trouble of messing with the directories and have the correct permissions set up right out of the box.  As a result, you do not experience the previouisly described error even if you install `webhint` globally.

<!-- links -->

[BrewMain]: https://brew.sh "Homebrew"

[GithubAutomatticNodeCanvasCompiling]: https://github.com/Automattic/node-canvas#compiling "Compiling - node-canvas - Automattic/node-canvas | GitHub"

[GithubCreationixNvm]: https://github.com/creationix/nvm "Node Version Manager - nvm-sh/nvm | GitHub"

[GithubNodeGfxCanvasPrebuilt27Commnet348037675]: https://github.com/node-gfx/node-canvas-prebuilt/issues/27#issuecomment-348037675 "issuecomment-348037675 - Add node-v48-win32-ia32? - node-gfx/node-canvas-prebuilt | GitHub"

[GithubWebhintioHint308]: https://github.com/webhintio/hint/issues/308 "Can't install via npm - canvas error - webhintio/hint | GitHub"
[GithubWebhintioHint47d51aeaa187351267f7b4cabd3f075de49d043d]: https://github.com/webhintio/hint/commit/47d51aeaa187351267f7b4cabd3f075de49d043d "Fix: Make `canvas` optional - webhintio/hint | GitHub"
[GitHubWebhintioHintNew]: https://github.com/webhintio/hint/issues/new "New Issue - webhintio/hint | GitHub"

[NpmjsPackageIltorb]: https://www.npmjs.com/package/iltorb "iltorb | npm"
[NpmjsDocsResolvingEaccesPermissionsErrorsInstallingPackagesGloballyChangeDefaultDirectory]: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally#manually-change-npms-default-directory "Manually change npm’s default directory - Resolving EACCES permissions errors when installing packages globally | npm"
[NpmjsDocsDownloadingInstallingUsingVersionManager]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm "Using a Node version manager to install Node.js and npm - Downloading and installing Node.js and npm | npm"
[NpmjsPackageWindowsBuildTools]: https://www.npmjs.com/package/windows-build-tools "windows-build-tools | npm"
