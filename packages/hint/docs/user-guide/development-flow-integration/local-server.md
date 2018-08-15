# Test a local server

In this scenario you want to run `webhint` against a local server that
is running the code you want to test. Usually the tasks to perform can be
reduced to:

1. Start server
1. Run webhint

A solution to automate this is via `npm scripts` and the `test` task.
The biggest concern is how to start both tasks and kill the other when
one ends in a multiplatform environment. For example, the following will
not work because `npm start` will start the server, it will not stop
(it'll be waiting for incoming requests), and thus never executing
`hint http://localhost:8080`:

```json
{
    ...
    "scripts": {
        ...
        "start": "start your web server somehow",
        "test": "npm start && hint http://localhost:8080",
        ...
    }
    ...
}
```

While there are some solutions like using just `&` or `|`, these don't
work in all platforms (nor is recommended to pipe the output). To solve
this issue, you will need to use a package that can start multiple `npm`
tasks simultaneously and coordinate them. [`npm-run-all`][npm-run-all] is
one of those.

As an example, the following [`npm script`][npm scripts] will build the
project, start [`http-server`][http-server] (assuming the output of the
build process is on the `dist` folder), run `webhint` on `localhost`
and once it ends, kill the server started by `http-server`:

```json
{
    ...
    "scripts": {
        ...
        "start": "http-server dist -s -g",
        "hint": "hint http://localhost:8080",
        "test": "npm build && npm-run-all -r -p http-server hint",
        ...
    }
    ...
}
```

<!-- Link labels: -->

[http-server]: https://www.npmjs.com/package/http-server
[jenkins]: https://jenkins.io
[local-server]: #test-a-local-server
[npm scripts]: https://docs.npmjs.com/misc/scripts
[npm-run-all]: https://www.npmjs.com/package/npm-run-all
[webhint github]: https://github.com/webhintio/hint/issues/new
[webhint repo]: https://github.com/webhintio/hint/
[webhint.io]: https://webhint.io
[webhintio repo]: https://github.com/webhintio/webhint.io/
