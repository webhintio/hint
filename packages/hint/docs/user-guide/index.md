# User guide

## Getting started

If you want to have an idea of what `webhint` does and you
have an updated version of `npm` (v5.2.0) and [Node LTS (v8.9.2)
or later][nodejs] you can use the following command:

Alternatively, you can install it locally with:

```bash
npm install -g --engine-strict hint
```

You can also install it as a `devDependency` if you prefer not to
have it globally.

The next thing that `webhint` needs is a `.hintrc` file. By
default, `webhint` will look for this file first in the current
folder and then in the user's home directory.

The fastest and easiest way to create one is by using the flag `--init`:

```bash
hint --init
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
hints (e.g.: [`SSL Labs`](./hints/hint-ssllabs.md)) can take a few minutes
to report the results.

### Default configuration

To run `webhint` you need a `.hintrc` file. If you don't have one,
`webhint` will use the [`web-recommended` set of hints][web recommended].
This configuration will be equivalent to the following `.hintrc`:

### Further reading

Now that you have `webhint` up and running, it is time to learn a bit more
about the different pieces:

* [Hints](./concepts/hints/)
* [Configurations](./concepts/configurations/)
* [Connectors](./concepts/connectors/)
* [Formatters](./concepts/formatters/)
* [Parsers](./concepts/parsers/)

### Permission issues during installation

If you receive an `EACCES` error when installing `webhint`, it is caused
by installing packages globally. The recommended solution is to [change
`npm`’s default directory][npm change default directory] and then try
again. There have been reports of this issue when installing the
dependency `canvas-prebuilt` throws an `EACCES`. This [issue][permission
issue] was resolved adopting the recommended solution. You can find
detailed steps on how to change the npm default directory [here][npm
change default directory]. According to [npm’s documentation][npm use
package manager], if you have node installed using a package
manager like [Homebrew][homebrew] or [nvm][nvm], you may be able to avoid
the trouble of messing with the directories and have the correct
permissions set up right out of the box. As a result, you won’t experience
the error described above even if you install `webhint` globally.

<!-- Link labels: -->

[homebrew]: https://brew.sh/
[nodejs]: https://nodejs.org/en/download/current/
[npm change default directory]: https://docs.npmjs.com/getting-started/fixing-npm-permissions#option-2-change-npms-default-directory-to-another-directory
[npm use package manager]: https://docs.npmjs.com/getting-started/fixing-npm-permissions#option-3-use-a-package-manager-that-takes-care-of-this-for-you
[nvm]: https://github.com/creationix/nvm
[permission issue]: https://github.com/sonarwhal/sonarwhal/issues/308
[web recommended]: https://github.com/sonarwhal/sonarwhal/tree/master/packages/configuration-web-recommended#readme
