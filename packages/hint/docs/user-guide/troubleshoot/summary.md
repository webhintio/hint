# Common issues when installing or running webhint

The team currently supports webhint on the latest 2 LTS and
current branch. While it is possible to run it on x86 version of
Node.js, it is recommended to use the x64 one. The reason is that
the project still uses some binary packages (`canvas` and `iltorb`)
and in most cases there are precompiled versions for x64 and thus
avoiding to compile anything.

This section contains the most commons issues reported by users with
potential fixes. If you run into something that is not documented
here please [open an issue in the hint repo][new issue].

## Windows Subsystem Linux

Due to the project using binary packages (`canvas` and `iltorb`)
you can find some problems related to building those packages on WSL:

> Info looking for cached prebuild @
 /home/mahome/.npm/_prebuilds/47fbee-iltorb-v2.4.3-node-v59-linux-x64.tar.gz
> WARN install No prebuilt binaries found (target=9.10.0 runtime=node
 arch=x64 libc= platform=linux)
> gyp ERR! build error
> gyp ERR! stack Error: not found: make

This is solved by installing the prerequisites of those packages [iltorb].
**However, due to the hard dependency on Puppeteer,
 we do not recommend using WSL to run webhint.**

If you want to run webhint on WSL, you need to create your own config
 file with this minimum content:

```json
{ "extends": ["web-recommended"], "connector": "jsdom" }
```

And then we need to pass the configuration to hint:

```bash
npx hint -c ./path/to/.hintrc https://example.com
```

## Building Windows packages

Depending on your environment you could get an error similar to the
following if there is a problem downloading any of the precompiled
native modules:

> gyp ERR! stack Error: Can't find Python executable "python"

Newer versions of Node.js (10+) on Windows ask users if they want the installer
to automatically install the required dependencies. You can use this method
or you can also install the [`windows-build-tools`][windows build tools].
From an **Elevated PowerShell** run the following:

```bash
npm install --global windows-build-tools
```

## Issues with `canvas`

Starting on `connector-jsdom v1.1.0`, `canvas` was changed to be an optional
dependency so while you might see some issues during the installation if the
binary is not available for download, the overall process should finish and
you should be able to execute `webhint` using the `jsdom` connector. The only
caveat is that images will not be downloaded.

This error happens more often:

* when there is a new release of Node.js and precompiled binaries for `canvas`
  are not yet available.
* if you are running Node.js x86 on Windows. The recommendation is to switch to
  x64 as [it is unlikely there will be x86 binaries any time soon][canvas x86].

You can also compile it yourself by following the [instructions][canvas compile].

## Permission issues during installation

If you receive an `EACCES` error when installing `webhint`, it is caused most
likely because of a global install. The recommended way is to install it as a
`devDependency` of your project (`npm install hint --save-dev`). If this is not
possible could try [change `npm`’s default directory][npm change default directory]
and then try again. There have been reports of this issue when installing the
dependency `canvas` throws an `EACCES`. This [issue][permission
issue] was resolved adopting the recommended solution. You can find
detailed steps on how to change the npm default directory [here][npm
change default directory]. According to [npm’s documentation][npm use
package manager], if you have Node.js installed using a package
manager like [Homebrew][homebrew] or [nvm][nvm], you may be able to avoid
the trouble of messing with the directories and have the correct
permissions set up right out of the box. As a result, you will not
experience the error described above even if you install `webhint`
globally.

<!-- Link labels: -->

[canvas compile]: https://github.com/Automattic/node-canvas#compiling
[canvas x86]: https://github.com/node-gfx/node-canvas-prebuilt/issues/27#issuecomment-348037675
[homebrew]: https://brew.sh/
[iltorb]: https://www.npmjs.com/package/iltorb
[new issue]: https://github.com/webhintio/hint/issues/new
[npm change default directory]: https://docs.npmjs.com/getting-started/fixing-npm-permissions#option-2-change-npms-default-directory-to-another-directory
[npm use package manager]: https://docs.npmjs.com/getting-started/fixing-npm-permissions#option-3-use-a-package-manager-that-takes-care-of-this-for-you
[nvm]: https://github.com/creationix/nvm
[optional canvas]: https://github.com/webhintio/hint/commit/47d51aeaa187351267f7b4cabd3f075de49d043d
[permission issue]: https://github.com/webhintio/hint/issues/308
[windows build tools]: https://www.npmjs.com/package/windows-build-tools
