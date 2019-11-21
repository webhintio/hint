# User guide

## Getting started

If you want to have an idea of what `webhint` does you will
need to use [Node.js 10 or later, x64 version recommended][nodejs]
and run the following command:

```bash
npx hint https://example.com
```

You can also run webhint from within [VS Code][] and as a
[browser extension][].

If you are going to add it to your project, the recommended way
is as a `devDependency`:

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

**NOTE**: If you run into any issues during the install process
please check the [troubleshoot section](./troubleshoot/summary.md).

You can also use webhint to analyze local files or directories and get
hints on different areas that are not available from a website (e.g.:
hints related to JSX, `tsconfig.json`, etc.).

Depending on the target to analyze it will use:

* [web-recommended][] if analyzing a website (i.e.: target starts with
  `http(s)://`).
* [development][] if analyzing a local file or directory.

If you want to change the connector, hints, etc. you can add a `.hintrc`
file in the current folder. To learn more about the format and the
options visit [configuring webhint][].

### Further reading

Now that you have `webhint` up and running, it is time to learn a bit more
about the different pieces:

* [Hints](./concepts/hints.md)
* [Configurations](./concepts/configurations.md)
* [Connectors](./concepts/connectors.md)
* [Formatters](./concepts/formatters.md)
* [Parsers](./concepts/parsers.md)

<!-- Link labels: -->

[configuring webhint]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[browser extension]: https://webhint.io/docs/user-guide/extensions/extension-browser/
[development]: https://webhint.io/docs/user-guide/configurations/configuration-development/
[nodejs]: https://nodejs.org/en/download/current/
[ssl labs]: https://webhint.io/docs/user-guide/hints/hint-ssllabs/
[VS Code]: https://webhint.io/docs/user-guide/extensions/vscode-webhint/
[web-recommended]: https://webhint.io/docs/user-guide/configurations/configuration-web-recommended/
