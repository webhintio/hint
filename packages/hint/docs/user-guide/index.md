# User guide

## Getting started

If you want to have an idea of what `webhint` does and you
have an updated version of `npm` (v5.2.0) and [Node.js LTS (v8.9.2)
or later, x64 version recommended][nodejs] you can use the
following command:

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
please check the [troubleshoot section](./troubleshoot/summary.md).

`webhint` needs a configuration file to know what `hint`s,
`connector`s, etc. to use. By default it will look for a `.hintrc`
file in the current folder and then in the user's home directory.
If none is found, it will use a built-in default configuration and
warn the user about it.

The recommended way to create the configuration file is by running:

```bash
npm create hintrc
```

This command will start a wizard that will ask you a series of
questions (e.g.: do you want to use a predefined `configuration` or prefer to
create one with the installed resource, what connector to use, formatter,
hints, etc.). Answer them and you will end up with something similar to the
following if you decided to use a predefined configuration:

```json
{
    "extends": ["configurationName"]
}
```

or the following if custom:

```json
{
    "connector": {
        "name": "connectorName"
    },
    "formatters": ["formatterName"],
    "hints": {
        "hint1": "error",
        "hint2": "warning",
        "hint3": "off"
    },
    "hintsTimeout": 120000
    ...
}
```

Then you have to run the following command to scan a website:

```bash
hint https://example.com
```

Wait a few seconds and you will get something similar to the following:

![Example output for the summary formatter](images/summary-output.png)

It might take a few minutes to get some of the results. Some of the
hints (e.g.: [`SSL Labs`][ssl labs]) can take a few minutes
to report the results.

### Default configuration

To run `webhint` you need a `.hintrc` file. If you do not have one,
`webhint` will use the [`web-recommended` set of hints][web recommended]
to analyze an URL or [`development`][development] if you are analyzing
an existing directory or file in your filesystem.
This configuration will be equivalent to the following `.hintrc`:

```json
{
    "extends": ["web-recommended"]
}
```

or

```json
{
    "extends": ["development"]
}
```

### Further reading

Now that you have `webhint` up and running, it is time to learn a bit more
about the different pieces:

* [Hints](./concepts/hints.md)
* [Configurations](./concepts/configurations.md)
* [Connectors](./concepts/connectors.md)
* [Formatters](./concepts/formatters.md)
* [Parsers](./concepts/parsers.md)

<!-- Link labels: -->

[nodejs]: https://nodejs.org/en/download/current/
[web recommended]: https://github.com/webhintio/hint/blob/master/packages/configuration-web-recommended/index.json
[development]: https://github.com/webhintio/hint/blob/master/packages/configuration-development/index.json
[ssl labs]: https://webhint.io/docs/user-guide/hints/hint-ssllabs/
[VS Code]: https://webhint.io/docs/user-guide/extensions/vscode-webhint/
[browser extension]: https://webhint.io/docs/user-guide/extensions/extension-browser/
