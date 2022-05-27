# webhint (`hint`)

## Quick start user guide

If you want to have an idea of what `webhint` does and you
have an updated version of `npm` (v6.x) and [Node.js LTS (v14.x)
or later, x64 version recommended](https://nodejs.org/en/download/current/)
you can use the following command:

```bash
npx hint https://example.com
```

The recommended way of running webhint is as a `devDependency` of
your project.

```bash
npm install hint --save-dev
```

And then add a script task to your `package.json`:

```json
{
    ...
    "scripts": {
        "webhint": "hint http://localhost:8080"
    }
}
```

And run it via:

```bash
npm run webhint
```

You can also run webhint from within [VS Code][] and as a
[browser extension][].

**NOTE**: If you run into any issues during the install process
please check the [troubleshoot section](https://github.com/webhintio/hint/blob/HEAD/packages/hint/docs/user-guide/troubleshoot/summary.md).

### Further reading

Now that you have `webhint` up and running, it is time to learn a bit
more about the different pieces:

* [Configurations](https://github.com/webhintio/hint/blob/HEAD/packages/hint/docs/user-guide/concepts/configurations.md)
* [Hints](https://github.com/webhintio/hint/blob/HEAD/packages/hint/docs/user-guide/concepts/hints.md)
* [Connectors](https://github.com/webhintio/hint/blob/HEAD/packages/hint/docs/user-guide/concepts/connectors.md)
* [Formatters](https://github.com/webhintio/hint/blob/HEAD/packages/hint/docs/user-guide/concepts/formatters.md)
* [Parsers](https://github.com/webhintio/hint/blob/HEAD/packages/hint/docs/user-guide/concepts/parsers.md)

## Contributing to webhint

To know more about the internals of `webhint`, the structure of the
project, how to create new hints, collectors, formatters, etc, take a
look at the online [contributor
guide](https://webhint.io/docs/contributor-guide/) (or the [local
version](https://github.com/webhintio/hint/blob/HEAD/packages/hint/docs/contributor-guide/index.md)).

## Code of Conduct

This project adheres to the JS Foundation’s [code of
conduct](https://js.foundation/community/code-of-conduct).
By participating in this project you agree to abide by its terms.

## License

The code is available under the [Apache 2.0 license](LICENSE.txt).

<!-- Link labels -->

[VS Code]: https://webhint.io/docs/user-guide/extensions/vscode-webhint/
[browser extension]: https://webhint.io/docs/user-guide/extensions/extension-browser/
