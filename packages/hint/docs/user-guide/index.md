# User guide

## Getting started

If you want to have an idea of what `webhint` does and you
have an updated version of `npm` (v5.2.0) and [Node LTS (v8.9.2)
or later][nodejs] you can use the following command:

```bash
npx hint https://example.com
```

Alternatively, you can install it locally with:

```bash
npm install -g --engine-strict hint
```

You can also install it as a `devDependency` if you prefer not to
have it globally (which is the team's preferred option).

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
`webhint` will use the [`web-recommended` set of hints][web recommended].
This configuration will be equivalent to the following `.hintrc`:

```json
{
    "extends": ["web-recommended"]
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
[ssl labs]: https://webhint.io/docs/user-guide/hints/hint-ssllabs/