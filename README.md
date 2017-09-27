# sonar

[![Build Status](https://travis-ci.org/sonarwhal/sonar.svg?branch=master)](https://travis-ci.org/sonarwhal/sonar)
[![Build status](https://ci.appveyor.com/api/projects/status/wor5orp1qard4b30/branch/master?svg=true)](https://ci.appveyor.com/project/NellieTheNarwhal/sonar/branch/master)
[![Greenkeeper badge](https://badges.greenkeeper.io/sonarwhal/sonar.svg?ts=1493307106027)](https://greenkeeper.io/)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/sonarwhal/Lobby)

## Quick start user guide

Once you have [`Node.js`](https://nodejs.org/en/download/current/)
v8.x on your machine, you can use `npx` or install `sonar` globally
to use it.

### Using `npx`

Just run the following command:

```bash
npx @sonarwhal/sonar https://example.com
```

This will start the wizard to create a `.sonarrc` file, and then
analyze `https://example.com`.

**Windows users**: Currently [`npx` has an issue in this
platform](https://github.com/npm/npm/issues/17869).

### Installing `sonar` globally

```bash
npm install -g --engine-strict @sonarwhal/sonar
```

Create a `.sonarrc` file by running this command and following the
instructions:

```bash
sonar --init
```

Scan a website:

```bash
sonar https://example.com
```

For more in depth information on how to get started, configurations,
and more, see the online [user guide](https://sonarwhal.com/docs/user-guide/),
or the [local version](./docs/user-guide/index.md) for the most recent
(and unstable) content.

## Quick start developer guide

To know more about the internals of `sonar`, how to create new
rules, collectors, formatters, etc, take a look at the online
[developer guide](https://sonarwhal.com/docs/user-guide/) (or
the [local version](./docs/developer-guide/index.md).

The following are meant only if you are working on `sonar`'s codebase:

* `npm run site <url>` will analyze the website with the current
   configuration and using the latest build available in the `dist`
   directory.
* `npm run site -- --debug <url>` same as above, but will show all
   the debug information.
* `npm run lint` will lint the code.
* `npm run watch` will start watchmode. This is the recommended task
   to run in the background while developing. It does the following:
  * sync all the resources from `src` to `dist` (basically anything
    that is not a `.ts` file).
  * compile the typescript files incrementally to `dist`.
  * run all the tests incrementally.
* `npm run build` will do the same as the `watch` task but only once
  and without running the tests.
* `npm test` will run the tests with code coverage using the code
  available in `dist`. It is better to run this task after `build`.

The initialization of the `watch` task is a bit especial: it will
compile and copy the assets before starting to watch for new files
to copy, build, or test. Because of concurrency, it might be that
the tests are run twice initially.

## Code of Conduct

This project adheres to the JS Foundation's [code of
conduct](https://js.foundation/community/code-of-conduct). By participating in this project you
agree to abide by its terms.

## License

The code is available under the [Apache 2.0 license](LICENSE.txt).
