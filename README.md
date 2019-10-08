# webhint

[![Build Status](https://dev.azure.com/webhint/webhint/_apis/build/status/webhintio.hint?branchName=master)](https://dev.azure.com/webhint/webhint/_build/latest?definitionId=3&branchName=master)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/webhintio/Lobby)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fwebhintio%2Fhint.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fwebhintio%2Fhint?ref=badge_shield)

## Quick start user guide

webhint is a customizable linting tool that helps you improve your site's
accessibility, speed, cross-browser compatibility, and more by checking your
code for best practices and common errors.

It can be run from the command line (CLI), via a [browser extension][], as a
[VS Code extension][], and from the [online service][].

To use it from the from the CLI you will need to install [`Node.js`][node]
(v10.x or later) on your machine, and you can use [`npx`][npx] to test it.

### Testing with `npx`

Run the following command:

```bash
npx hint https://example.com
```

This will analyze `https://example.com` using the default configuration.

### Installing `webhint` locally

Install webhint as a `devDependency` of your project:

```bash
npm install hint --save-dev
```

And then add a script task to your `package.json`:

```json
{
    ...
    "scripts": {
        "webhint": "hint"
    }
}
```

And run it via:

```bash
npm run webhint -- http://localhost:8080
```

Or if you are using `yarn` you can skip the step to create a task and
run directly:

```bash
yarn hint http://localhost:8080
```

To know more about webhint, how to configure it, etc. see the online
[user guide][user guide], or the [local version][local user guide]
for the most recent content.


## Contributing to webhint

This project follows a monorepo pattern. That means that the code
for all the webhint flavors (CLI, browser and VS Code extension,
hints, formatters, etc.) are in here and are published as separate
npm packages.

To build the project from the source you will need to install
a recent version of node and [yarn][]. Once you've done this run
the following from the root of your cloned version:

```bash
yarn
yarn build
```

This can take a bit so please be patient.

To know more about the internals of `webhint`, the structure of the
project, how to create new hints, collectors, formatters, etc, take
a look at the online [contributor guide][contributor guide] (or the
[local version][local contributor guide]).

### Contributing to the browser and VS Code extensions

To know more about how to build only the extensions please check
the `CONTRIBUTING.md` files of each one of this packages:

* [`packages/extension-browser/CONTRIBUTING.md`][contrib browser]
  for the browser extension.
* [`packages/extension-vscode/CONTRIBUTING.md`][contrib vscode]
  for the VS Code extension.

## Code of Conduct

This project adheres to the JS Foundation’s [code of conduct][coc].
By participating in this project you agree to abide by its terms.

## License

The code is available under the [Apache 2.0 license][license].

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fwebhintio%2Fhint.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fwebhintio%2Fhint?ref=badge_large)

<!-- Link labels: -->

[browser extension]: https://webhint.io/docs/user-guide/extensions/extension-browser/
[coc]: https://js.foundation/community/code-of-conduct
[contrib browser]: ./packages/extension-browser/CONTRIBUTING.md
[contrib vscode]: ./packages/extension-vscode/CONTRIBUTING.md
[contributor guide]: https://webhint.io/docs/contributor-guide/
[license]: LICENSE.txt
[local contributor guide]: ./packages/hint/docs/contributor-guide/index.md
[local user guide]: ./packages/hint/docs/user-guide/index.md
[node]: https://nodejs.org/en/download/current/
[npx]: https://github.com/zkat/npx
[online service]: https://webhint.io/scanner/
[user guide]: https://webhint.io/docs/user-guide/
[VS Code extension]: https://webhint.io/docs/user-guide/extensions/vscode-webhint/
[yarn]: http://yarnpkg.com/
