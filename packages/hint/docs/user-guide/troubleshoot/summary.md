# Common issues when installing or running webhint

While the team has made progress in removing the possibilities of
running into issues while installing the project, you could still
run into some issues especially when dealing with binary packages
(`canvas` and `iltorb` are the currently used ones).

This section contains the most commons issues reported by users with
potential fixes. If you run into something that is not documented
here please [open an issue in the hint repo][new issue].

## Building Windows packages

Depending on your environment you could get an error similar to the
following if there is a problem downloading any of the precompiled
native modules:

> gyp ERR! stack Error: Can't find Python executable "python"

Newer versions of node (10+) on Windows ask users if they want the installer
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
you should be able to execute `webhint` using the `jsdom` connector. The only caveat
is that images will not be downloaded.

This error happens more often:

* when there is a new release of node and precompiled binaries for `canvas`
  are not yet available.
* if you are running node x86 on Windows. The recommendation is to switch to
  x64 as [it is unlikely there will be x86 binaries any time soon][canvas x86].

You can also compile it yourself by following the [instructions][canvas compile].

## Permission issues during installation

If you receive an `EACCES` error when installing `webhint`, it is caused
by installing packages globally. The recommended solution is to [change
`npm`’s default directory][npm change default directory] and then try
again. There have been reports of this issue when installing the
dependency `canvas` throws an `EACCES`. This [issue][permission
issue] was resolved adopting the recommended solution. You can find
detailed steps on how to change the npm default directory [here][npm
change default directory]. According to [npm’s documentation][npm use
package manager], if you have node installed using a package
manager like [Homebrew][homebrew] or [nvm][nvm], you may be able to avoid
the trouble of messing with the directories and have the correct
permissions set up right out of the box. As a result, you will not
experience the error described above even if you install `webhint`
globally.

<!-- Link labels: -->

[canvas compile]: https://github.com/Automattic/node-canvas#compiling
[canvas x86]: https://github.com/node-gfx/node-canvas-prebuilt/issues/27#issuecomment-348037675
[homebrew]: https://brew.sh/
[new issue]: https://github.com/webhintio/hint/issues/new
[npm change default directory]: https://docs.npmjs.com/getting-started/fixing-npm-permissions#option-2-change-npms-default-directory-to-another-directory
[npm use package manager]: https://docs.npmjs.com/getting-started/fixing-npm-permissions#option-3-use-a-package-manager-that-takes-care-of-this-for-you
[nvm]: https://github.com/creationix/nvm
[optional canvas]: https://github.com/webhintio/hint/commit/47d51aeaa187351267f7b4cabd3f075de49d043d
[permission issue]: https://github.com/webhintio/hint/issues/308
[windows build tools]: https://www.npmjs.com/package/windows-build-tools
