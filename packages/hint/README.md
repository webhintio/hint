# webhint (`hint`)

## Quick start user guide

If you want to have an idea of what `webhint` does and you
have an updated version of `npm` (v5.2.0) and [Node.js LTS (v8.9.2)
or later, x64 version recommended][https://nodejs.org/en/download/current/]
you can use the following command:

```bash
npx hint https://example.com
```

Alternatively, you can install it globally with:

```bash
npm install -g --engine-strict hint

hint https://example.com
```

You can also install it as a `devDependency` if you prefer not to
have it globally (which is the team's preferred option).

**NOTE**: If you run into any issues during the install process
please check the [troubleshoot section](./troubleshoot/summary.md).


### Further reading

Now that you have `webhint` up and running, it is time to learn a bit
more about the different pieces:

* [Configurations](./concepts/configurations.md)
* [Hints](./concepts/hints.md)
* [Connectors](./concepts/connectors.md)
* [Formatters](./concepts/formatters.md)
* [Parsers](./concepts/parsers.md)

## Contributing to webhint

To know more about the internals of `webhint`, the structure of the
project, how to create new hints, collectors, formatters, etc, take a
look at the online [contributor
guide](https://webhint.io/docs/contributor-guide/) (or the [local
version](./docs/contributor-guide/index.md)).

## Code of Conduct

This project adheres to the JS Foundation’s [code of
conduct](https://js.foundation/community/code-of-conduct).
By participating in this project you agree to abide by its terms.

## License

The code is available under the [Apache 2.0 license](LICENSE.txt).
