# Sonar

[![Build Status](https://travis-ci.com/MicrosoftEdge/Sonar.svg?token=ie6AidxpTLajKCNExwqL&branch=master)](https://travis-ci.com/MicrosoftEdge/Sonar) [![Greenkeeper badge](https://badges.greenkeeper.io/MicrosoftEdge/Sonar.svg?token=b8370543b9160bd1bb844502495c4226139b92230cd84c3f5f4c58c669275c51&ts=1493307106026)](https://greenkeeper.io/)

## Tasks

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

## Documentation

### Developer guides

#### Collectors

* [How to develop a collector](docs/developer-guide/collectors/index.md)
* [List of events emitted by a collector](docs/developer-guide/collectors/events.md)

#### Formatters

* [How to develop a formatter](docs/developer-guide/formatters/index.md)

#### Rules

* [How to develop a rule](docs/developer-guide/rules/index.md)
* [How to test a rule](docs/developer-guide/rules/how-to-test-rules.md)

### User guides

* [Getting started](docs/user-guide/index.md)

  * [Collectors](docs/user-guide/collectors/index.md)
  * [Formatters](docs/user-guide/formatters/index.md)
  * [Rules](docs/user-guide/rules/index.md)

## Code of Conduct

This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md).
By participating in this project you agree to abide by its terms.

## License

The code is available under the [Apache 2.0 license](LICENSE.txt).
