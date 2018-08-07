# webhint (`hint`)

## Quick start user guide

Once you have [`Node.js`](https://nodejs.org/en/download/current/)
v8.x on your machine, you can use `npx` or install `webhint` globally
to use it.

### Using `npx`

Run the following command:

```bash
npx hint https://example.com
```

This will analyze `https://example.com` using the default configuration.

### Installing `webhint` globally

```bash
npm install -g --engine-strict hint
```

Create a `.hintrc` file by running this command and following the
instructions:

```bash
npm create hintrc
```

Scan a website:

```bash
hint https://example.com
```

For more in depth information on how to get started, configurations,
and more, see the online [user guide](https://webhint.io/docs/user-guide/),
or the [local version](./docs/user-guide/index.md)
for the most recent (and unstable) content.

## Contributing to hint

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
