# Contributing to the webhint web worker

## Build and Test

### Build after initial checkout

From the root of the repo run the following:

```bash
yarn
yarn build
cd packages/utils-worker
```

### Rebuild after changes

To rebuild just the web worker you can

```bash
yarn build
```

from `packages/utils-worker`.

### Test development build

To test the web worker you can

```bash
yarn test
```

To validate new hints are working correctly, add a failure case to
`tests/fixtures/basic-hints.html` and add logic to check for reports in
`tests/integration.ts`.

### Release builds

Running the release build will generate `packages/utils-worker/webhint.js`
which can be loaded directly within a web worker.

```bash
yarn build-release
```

### Exploring the used dependencies

To know what dependencies are being bundled in the extension you can run
the following from `packages/utils-worker`:

```bash
yarn webpack-stats
```

This will generate a (big) `stats.json` file.

Go to [webpack visualizer][] or a similar tool and drop that file there to
explore all the dependencies in the package.

### Adding a new hint or parser

Just add the appropriate `@hint/hint-*` or `@hint/parser-*` package as a
`devDependency` in `package.json`. The build scripts
`"scripts/import-hints.js"` and `"scripts/import-parsers.js"` will take care
of the rest:

```json
  "devDependencies": {
    "@hint/hint-new": "^1.0.0",
    "@hint/parser-new": "^1.0.0"
  }
```

<!-- Link labels -->

[webpack visualizer]: https://chrisbateman.github.io/webpack-visualizer/
