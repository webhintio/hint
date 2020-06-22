# Test a hint

When testing a hint you might need to do different things like forcing a fail
request, return a binary, etc. This page documents what you need to do to start
testing a hint and how to configure the test server to do what you need.

## Getting started

If you have used the built-in tools to create a new hint (core or custom),
everything should already set up to use `hint-runner.ts` under
(`utils-tests-helpers`) and the `testHint` method.

If not, you need to:

1. Create a `tests.ts` file in the hint folder like `hint-<hint-id>/src/tests/tests.ts`.
1. Have the following template:

```ts
import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';

const hintPath = getHintPath(__filename);

const tests: HintTest[] = [
    {
        name: 'This test should pass',
        serverConfig: generateHTMLPage()
    },
    {
        name: `This test should fail`,
        reports: [{ message: `This should be your error message` }],
        serverConfig: generateHTMLPage()
    }
];

testHint(hintPath, tests);
```

The high level overview of what's is happening in the code above is as follows:

1. `tests` (of type `HintTest[]`) contains the list of things to test, the
   server configuration to use (`serverConfig`) and the expected result(s)
   (`reports`). If no results are defined that means `webhint` should not
   fail that configuration. Otherwise the results should match the ones
   defined.
1. `hintRunner.testHint` will take an `HintTest[]` and create a web server
   for each one of the items in it. It will also create a `webhint` object
   with just the hint to test configured and run it against the web server for
   that particular test.
   The results from executing it are compared to those defined in
   `HintTest.reports`. If they match, then everything is good.
1. If the `reports` property is not specified, the actual results of the
   test will be logged. This can be used to debug what is being returned by the
   tests.

There's more information and detail in the following sections.

## `HintTest`

`HintTest` defines a test that needs to be validated. Its properties are:

* `name`: The name of the test. It's a good practice to say what the test is
  testing and what is the expected output. E.g.: "meta charset in body should
  fail"
* `serverConfig`: This is the server configuration used for that particular
  test. When running the tests, a local web server will be created for each
  `HintTest` on a random port that `webhint` will analyze. There's more
  information about `serverConfig` below.
* `reports`: An array of `Report`s to match with the output of running
  `webhint` to the specified configuration. A `Report` is what `webhint`
  returns when it finds an issue. In this scenario, only the properties defined
  on each `Report` will be matched. This means you can decide to ignore some
  that are not relevant to you, i.e.: in the code above you could decide to
  remove `position` and the test engine will not try to validate that property.

### `position`

When specified, `position` can be a `ProblemLocation` or a string of text in
the source to derive a `ProblemLocation` from. The latter is recommended when
possible as it is less error-prone.

```ts
// `position` as a `ProblemLocation`
const tests: HintTest[] = [
    {
        name: 'Name of the tests',
        serverConfig: 'HTML to use',
        reports: [{
            message: 'Error message targeting the word "HTML"',
            position: { column: 0, line: 0 }
        }]
    },
    { ... }
];
```

```ts
// `position` as a `match`
const tests: HintTest[] = [
    {
        name: 'Name of the tests',
        serverConfig: 'HTML to use',
        reports: [{
            message: 'Error message targeting the word "HTML"',
            position: { match: 'HTML' }
        }]
    },
    { ... }
];
```

### Execute code `before` or `after` collecting the results

In some scenarios you need to execute some code `before` or `after`
the actual tests (e.g.: if you need to mock a dependency). For those
cases you can use the `before` and `after` properties of `HintTest`:

```ts
const tests: HintTest[] = [
    {
        after() {
            // Code to execute right before calling `connector.close` goes here.
        }
        before() {
            // Code to execute before the creation of the engine object goes here.
        },
        name: 'Name of the tests',
        serverUrl: 'https://example.com',
        reports: [{
            message: 'Message the error will have'
        }]
    },
    { ... }
];
```

An example will be if the hint integrates with another service. You don't want
to actually connect to that service during the tests (slow down, need to force
an specific output, etc.) so you will mock the connection to that service in
the `before` property.
[An example of hint that does this is `ssllabs`][ssllabs tests] where the call
to the server is completely mocked to return different grades.

## `serverConfig`

`serverConfig` defined the web server configuration to use for a given test.
It can be of different types depending on your particular needs:

* `string` containing the response for `/` (HTML, plain text, etc.).
* `object` with paths as properties names and their content as values:

```js
const serverConfig = {
    '/': 'some HTML here',
    'site.webmanifest': 'other content'
};
```

This code will create a local web server that will return `some HTML here` to
all requests done to `/` and with `other content` to the requests done to
`site.webmanifest`.

You can even specify the headers and status code for the response for
a specific path, by using the `headers` and `status` properties:

```js
const serverConfig = {
    '/': 'page content goes here...',
    '/example.js': {
        content: 'script content goes here...',
        headers: {
            'Content-Type': 'text/javascript; charset=utf-8',
            Header: 'value'
            // ...
        },
        status: statusCode
    }
};
```

Notes:

* If `content` is not specified, it will default to an empty string `''`.
* To remove any of the default HTTP response headers, set their value
  to `null` (e.g.: `headers: { '<response_header>': null }`).
* `status` defaults to `200`, so it only needs to be specified if its
  value is different.

### Conditional `response`s

Sometimes you need the server to respond differently to a route depending
on the contents of a `request`, e.g.: when requesting an asset that can be
compressed with different formats. The following is an example of how you
can return a different value depending on the content of the
`Accept-Encoding` header:

```ts
const serverConfig = {
    '{ "request": { "headers":{ "Accept-Encoding":"gzip" }}}': {
        '/': {
            content: { /* content here */ },
            headers: { /* headers here */ }
        },
        // ...
    },
    '{ "request": { "headers":{ "Accept-Encoding":"br" }}}': {
        '/': {
            content: { /* content here */ },
            headers: { /* headers here */ }
        },
        // ...
    }
}
```

### Throwing an error

If you need to force an error in the `connector` when visiting a URL
you have to make the content `null`. This will force a redirect to
`test://fail`, thus, causing an exception.

## Testing an external URL

If you need to test an external resource (because you are integrating
with a third party service) you need to use the property `serverUrl`:

```ts
const tests: HintTest[] = [
    {
        name: 'Name of the tests',
        reports: [{
            message: 'Message the error will have'
        }],
        serverUrl: 'https://example.com'
    },
    { ... }
];
```

## `hintRunner.testHint()`

`hintRunner` is in charge of executing and validating the tests. The signature
of `hintRunner.testHint` is:

* `hintPath`, the name of the hint being tested.
* `tests`, an `HintTest[]`.
* `configuration` (optional), allows you to modify the defaults of how the
   tests are run.

`configuration` can have the following properties:

```json
{
    "browserslist": [],
    "https": boolean, // default is false
    "hintOptions": {
        // hint properties
    }, // default is an empty object
    "serial": boolean, //default is true
}
```

* `browserslist`: You can change the targeted browsers to check that the hint
  adapts correctly with this property. It uses the same format as the one in
  `.hintrc`.
* `https`: By default all tests are run over HTTP. If you need to test
  something over HTTPS you want to set this property to `true`.
  **NOTE**: Do not mix HTTP and HTTPS tests in the same file as it will not run
  correctly.
* `serial`: By default all tests are run in parallel. If you need to run them
  serially set it to `true`
* `hintOptions`: Some hints allow further configuration. You can test those
  configurations with this property.

Each web server is started on a random port. If the `message` of a `report`
contains `localhost`, it will be replaces automatically with
`localhost:USEDPORT` so you don't have to worry about it.

**Note**: `hint-runner` will automatically test the hint in as many connectors
as possible, that's the reason why you might see tests being run more than
once.

<!-- link labels -->

[ssllabs tests]: https://github.com/webhintio/hint/blob/main/packages/hint-ssllabs/tests/tests.ts
