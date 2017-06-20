# sonar

[![Build Status](https://travis-ci.org/sonarwhal/sonar.svg?branch=master)](https://travis-ci.org/sonarwhal/sonar) [![Greenkeeper badge](https://badges.greenkeeper.io/sonarwhal/sonar.svg?ts=1493307106027)](https://greenkeeper.io/)

## Quick start user guide

Install sonar in your machine:

```bash
npm install -g @sonarwhal/sonar
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

You can find more information in the online
[user guide](https://sonarwhal.com/docs/user-guide/), or the [local
version](./docs/user-guide/index.md) for the most recent (and unstable)
one.

## Quick start developer guide

To know more about the internals of sonar, how to create new rules,
collectors, formatters, etc, take a look at the online
[developer guide](https://sonarwhal.com/docs/user-guide/),
or the [local version](./docs/developer-guide/index.md).

The following are meant only if you are working on sonar's codebase:

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

This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md).
By participating in this project you agree to abide by its terms.

## License

The code is available under the [Apache 2.0 license](LICENSE.txt).
