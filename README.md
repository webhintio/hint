# Sonar [![Build Status](https://travis-ci.com/MicrosoftEdge/Sonar.svg?token=ie6AidxpTLajKCNExwqL&branch=master)](https://travis-ci.com/MicrosoftEdge/Sonar)


## Tasks

* `npm run site -- https://example.com` will analyze the website with
   the current configuration and using the latest build available in
   the `dist` folder.
* `npm run lint` will lint the code under `src`.
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

#### Developer guides

* [How to develop a collector](docs/developer-guide/collectors/how-to-develop-a-collector.md)
* [How to test rules](docs/developer-guide/rules/how-to-test-rules.md)
* [List of events](docs/developer-guide/events/list-of-events.md)

#### User guides

* [Differences among collectors](docs/user-guide/differences-among-collectors.md)


## License

The code is available under the [Apache 2.0 license](LICENSE.txt).
