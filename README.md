# webhint

[![Build Status](https://dev.azure.com/webhint/webhint/_apis/build/status/webhintio.hint?branchName=master)](https://dev.azure.com/webhint/webhint/_build/latest?definitionId=3&branchName=master)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/webhintio/Lobby)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fwebhintio%2Fhint.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fwebhintio%2Fhint?ref=badge_shield)

## Quick start user guide

Once you have [`Node.js`][node] (v8.x or later) on your machine, you can use
[`npx`][npx] to test it.

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

To know more about the internals of `webhint`, the structure of the
project, how to create new hints, collectors, formatters, etc, take
a look at the online [contributor guide][contributor guide] (or the
[local version][local contributor guide]).

## Code of Conduct

This project adheres to the JS Foundation’s [code of conduct][coc].
By participating in this project you agree to abide by its terms.

## License

The code is available under the [Apache 2.0 license][license].

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fwebhintio%2Fhint.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fwebhintio%2Fhint?ref=badge_large)

<!-- Link labels: -->

[coc]: https://js.foundation/community/code-of-conduct
[contributor guide]: https://webhint.io/docs/contributor-guide/
[local contributor guide]: ./packages/hint/docs/contributor-guide/index.md
[local user guide]: ./packages/hint/docs/user-guide/index.md
[node]: https://nodejs.org/en/download/current/
[npx]: https://github.com/zkat/npx
[user guide]: https://webhint.io/docs/user-guide/
[license]: LICENSE.txt
