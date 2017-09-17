# User guide

## Getting started

Getting started with `sonar`'s CLI is really easy. First you need
to have [Node.js v8.x][nodejs] installed and then run:

```bash
npm install -g --engine-strict @sonarwhal/sonar
```

You can also install it as a `devDependency` if you prefer not to
have it globally.

The next thing that `sonar` needs is a `.sonarrc` file. The fastest
and easiest way to create one is by using the flag `--init`:

```bash
sonar --init
```

This command will start a wizard that will ask you a series of
questions (e.g.: what connector to use, what formatter, which rules,
etc.). Answer them and you will end up with something similar to the
following:

```json
{
    "connector": {
        "name": "connectorName"
    },
    "formatters": ["formatterName"],
    "rules": [
        "rule1",
        "rule2:warning",
        "rule3:off"
    ],
    "rulesTimeout": 120000
}
```

Then you just have to run the following command to scan a website:

```bash
sonar https://example.com
```

Wait a few seconds and you will get the results. It might take a while
to get some of the results. Some of the rules (e.g.:
[`SSL Labs`](./rules/ssllabs.md)) can take a few minutes to report the
results.

Now that you have your first result, is time to learn a bit more about
the different pieces:

* [Rules](#rules)
* [Connectors](#connectors)
* [Formatters](#formatters)

## Connectors and platform support

All the built-in `connector`s run in any of the supported platforms:
Linux, macOS, and Windows. The only caveat is that when selecting a
`connector` for a browser (such as `chrome`) in `.sonarrc`, the browser
needs to be on the machine. `sonar` will not install it if it isn't.

**Note:** If you are running Windows 10 [build 14951][wsl-interop] (or
later) and Windows Subsystem for Linux (WSL), `sonar` will be capable
of running the browsers installed directly on Windows. If you are a
user of the stable release of Window, you will need to use at least the
*Fall Creators Update*.

## Permission Issue

If you receive an `EACCES` error when installing `sonar`, it is caused
by installing packages globally. The recommended solution is to [change
`npm`'s default directory][npm change default directory] and then try
again. So far, one such permission issue has been reported when user
tries to install `sonar` on [Windows Subsystem for Linux][wsl] or macOS
globally. Dependency `canvas-prebuilt` throws an `EACCES` error during
the installation process, and this [issue][permission issue] was resolved
adopting the recommended solution. You can find detailed steps on how
to change the npm default directory [here][npm change default directory].
However, according to [npm's documentation][npm use package manager],
if you have your node installed on macOS using a package manager like
[Homebrew][homebrew] instead of its installer, you may be able to avoid
the trouble of messing with the directories and have the correct
permissions set up right out of the box. As a result, you won't experience
the error described above even if you install `sonar` globally on macOS.

## Rules

A `rule` is a test that your website needs to pass. `sonar` comes with
a few [built in ones](./rules/), but you can easily create your own or
download them from `npm`. You can read more about
[how to create rules in the developer guide](../developer-guide/rules/index.md).

### Rule configuration

When using `sonar`, you are always in control. This means that you can
decide what rules are relevant to your use case and what severity a rule
should have:

* `off`: The rule will not be executed. This is the same as not having
  the rule under the `rules` section of a `.sonarrc` file.
* `warning`: The rule will be executed but it will not change the exit
  status code if an issue is found.
* `error`: The rule will be executed and will change the exit status
  code to `1` if an issue is found.

Rules can be configured using the array or object syntax:

```json
{
    "rules": [
        "rule1:warning"
    ]
}
```

```json
{
    "rules": {
        "rule1": "warning"
    }
}
```

The `off` and `warning` rule severities may be applied with shorthand
characters `-` and `?` respectfully when using the array syntax:

A rule that has the `off` severity applied:

```json
"rules": [
    "-rule1"
]
```

A rule that has the `warning` severity applied:

```json
"rules": [
    "?rule1"
]
```

Additionally, some rules allow further customization. The configuration
in that case it will be similar to the following:

```json
"rules": [
    ["rule1:warning", {
        "customization1": "value1",
        "customization2": "value2"
    }]
]
```

You can check which rules accept this kind of configuration by
visiting the [rules documentation](./rules/).

### Ignoring domains

Sometimes you don't have control over all the infrastructure and there
is nothing you can do about it. Reporting errors in those cases just
generates noise and frustration. Instead of globally disabling a rule
you might just want to turn it off for a domain, or directly ignore
completely one (like a third party analytics, ads, etc.). To achieve
this you need to add the `ignoredUrls` property to your `.sonarrc` file:

```json
"ignoredUrls": {
    ".*\\.domain1\\.com/.*": ["*"],
    "www.domain2.net": ["disallowed-headers"]
}
```

Properties can be:

* regular expressions, like `.*\\.domain1\\.com/.*`. This will match:
  * `something.domain1.com/index.html`
  * `somethingelse.domain1.com/image.png`
* some text, like `www.domain2.net`. In this case, if the resource URL
  contains the text, it will be a match. E.g.:
  * `www.domain2.net/index.php`
  * `www.domain2.net/image.png`

The value of the property has to be an array of strings where the
strings can be:

* `*` if you want to ignore all rules for the given domain.
* The ID of the rule to be ignored.

In the previous example we will:

* Ignore all rules for any resource that matches the regex
  `.*\\.domain1\\.com/.*`.
* Ignore the rule `disallowed-headers` for the domain `www.domain2.net`.

### Rules timeout

Even though rules are executed in parallel, sometimes one can take too
long and prevent `sonar` to finish (e.g.: when using an external service,
long script execution, etc.).

To prevent this situation, each rule needs to finish in under 2 minutes.
You can modify this threshold by using the property `rulesTimeout` in
your `.sonarrc` file.

## Browser configuration

`sonar` allows you to define your browser support matrix by adding
the property `browserslist` to your `.sonarrc` file. This property
follows the same convention as [`browserslist`][browserslist]:

```json
{
    "browserslist": [
        "> 1%",
        "last 2 versions"
    ]
}
```

By specifying this property, you are giving more information to the
rules and they might decide to adapt their behavior. An example of
a rule taking advantageSome of this property is
[`highest-available-document-mode`](./rules/highest-available-document-mode.md).
This rule will advice you to use `edge` mode if you need to support
versions of IE prior IE10, or tell you to remove that tag or header
it you only need IE11+ because document modes were removed at that
version.

If no value is defined, [`browserslist`'s defaults][browserslist defaults] will
be used:

```js
browserslist.defaults = [
    '> 1%',
    'last 2 versions',
    'Firefox ESR'
];
```

## Connectors

A `connector` is the interface between the `rule`s and the website
you are testing.

To configure a connector you need to update your `.sonarrc` file to
make it look like the following:

```json
{
    "connector": {
        "name": "connectorName"
    }
}
```

Where `connectorName` is the name of the connector.

`connector`s can be configured as well. Maybe you want to do request
with another `userAgent`, change some of the other defaults, etc. To
do that, you just have to add a property `options` to your `connector`
property with the values you want to modify:

```json
"connector": {
    "name": "connectorName",
    "options": {}
}
```

The [`connector`s documentation](./connectors/index.md) has more
information of what can be configured in each one.

## Formatters

A `formatter` takes the results of executing all the rules and
transforms them to be consumed by the user. A `formatter` can output
the results via the `console` in different formats, a `JSON` file,
`XML`, etc.

You can specify one or more `formatter`s as the output. E.g.: You want
a summary in the screen as well as a text report. You just need to
add the name inside the property `formatters`:

```json
{
  "formatters": [
      "formatter1",
      "formatter2"
  ]
}
```

Please see [the current list of supported `formatter`s](./formatters/index.md)
to know more.

<!-- Link labels: -->

[browserslist]: https://github.com/ai/browserslist
[browserslist defaults]: https://github.com/ai/browserslist/blob/3b8e4abfbfe36d01859a0e70292106be0fe70c8f/index.js#L303
[homebrew]: https://brew.sh/
[nodejs]: https://nodejs.org/en/download/current/
[npm change default directory]: https://docs.npmjs.com/getting-started/fixing-npm-permissions#option-2-change-npms-default-directory-to-another-directory
[npm use package manager]: https://docs.npmjs.com/getting-started/fixing-npm-permissions#option-3-use-a-package-manager-that-takes-care-of-this-for-you
[permission issue]: https://github.com/sonarwhal/sonar/issues/308
[wsl]: https://msdn.microsoft.com/en-us/commandline/wsl/install_guide
[wsl-interop]: https://msdn.microsoft.com/en-us/commandline/wsl/release_notes#build-14951
