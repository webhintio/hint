# Web worker for webhint

The webhint web worker utility provides a bundled version of webhint
suitable for running inside a web worker in a browser environment.

## Installation

This package can be installed via npm by running the following:

```bash
npm install @hint/utils-worker --save
```

A pre-built version of the webhint web worker is included as part of this
package named `webhint.js`. You can locate the file in Node using
`require.resolve('@hint/utils-worker/webhint.js')`.

## Usage

The included `webhint.js` file is intended to be loaded via a web worker
and communicated with via `postMessage`. Information about the content to
be analyzed must be passed to the worker and the worker will return any
issues identified as a result.

```ts
const worker = new Worker('webhint.js');
worker.addEventListener('message', (event) => {
    if (event.data.requestConfig) {
        // Tell worker the URL of the page being analyzed.
        worker.postMessage({ config: { resource: 'https://example.com' } });
    } else if (event.data.ready) {
        // Once ready, forward network requests.
        worker.postMessage({ fetchStart });
        worker.postMessage({ fetchEnd });
        // Once ready, forward snapshot of the DOM (see @hint/utils-dom).
        worker.postMessage({ snapshot });
    } else if (event.data.results) {
        // Process/display results (occurs multiple times).
    } else if (event.data.error) {
        // Log/handle fatal errors reported by the worker.
    }
});
```

The worker contains a subset of hints suitable for running in a browser
environment without direct access to the page. These hints can be
disabled or configured using the same format as [.hintrc][hintrc]
files. Just pass the object as `userConfig` when sending the
configuration.

```ts
worker.postMessage({
    config: {
        resource: 'https://example.com',
        userConfig: {
            browserslist: 'defaults, not IE 11',
            hints: {
                'compat-api/css': ['error', {
                    'ignore': ['border-radius', 'box-lines'],
                }],
                'css-prefix-order': 'off'
            }
        }
    }
});
```

All included hints are enabled by default. To disable all included
hints and selectively enable only a few, change the default severity.

```ts
worker.postMessage({
    config: {
        defaultHintSeverity: 'off',
        userConfig: {
            hints: {
                'button-type': 'default'
            }
        }
    }
});
```

## Contributing to the worker

To contribute to the worker please read the [`CONTRIBUTING.md`][contributing]
file of the package.

<!-- Link labels -->

[contributing]: https://github.com/webhintio/hint/blob/master/packages/utils-worker/CONTRIBUTING.md
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
