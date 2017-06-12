# User guide

## Getting started

Getting started with `sonar`'s CLI is really easy. First you need
to install it:

```bash
npm install -g @sonarwhal/sonar
```

You can also install it as a `devDependency` if you prefer not to
have it globally.

The next thing that `sonar` needs is a `.sonarrc` file. The fastest
and easiest way to create one is by using the flag `--init`:

```bash
sonar --init
```

This command will start a wizard that will ask you a series of questions
(e.g.: what collector to use, what formatter, which rules, etc.). Answer
them and you will end up with something similar to the following:

```json
{
    "collector": {
        "name": "collectorName"
    },
    "formatter": "formatterName",
    "rules": {
        "rule1": "error",
        "rule2": "error",
        "rule3": "error"
    },
    "rulesTimeout": 120000
}
```

Then you just have to run the following command to scan a website:

```bash
sonar https://example.com
```

Wait a few seconds and you will get the results. It might take a while
to get some of the results. Some of the rules can take a few minutes to
report the results (e.g.: [`SSL Labs`](./rules/ssllabs.md)).

Now that you have your first result, is time to learn a bit more about
the different pieces:

* [Rules](#rules)
* [Collectors](#collectors)
* [Formatters](#formatters)

## Rules

A `rule` is a test that your website needs to pass. `sonar` comes with
a few [built in ones](./rules/), but you can easily create your own or
download them from `npm`. You can read more about
[how to create rules in the developer guide](../developer-guide/rules/index.md).

### Rule configuration

When using sonar, you are always in control. This means that you can
decide what rules are relevant to your use case and what severity a rule
should have:

* `off`: The rule will not be executed. This is the same as not having
  the rule under the `rules` section of a `.sonarrc` file.
* `warning`: The rule will be executed but it will not change the exit
  status code if an issue is found.
* `error`: The rule will be executed and will change the exit status
  code to `1` if an issue is found.

Additionally, some rules allow further customization. The configuration
in that case it will be similar to the following:

```json
"rules": {
    "rule1": ["severity", {
        "customization1": "value1",
        "customization2": "value2"
    }]
}
```

You can check which rules accept this kind of configuration by
visiting the [rules documentation](./rules/).

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

sonar allows you to define your browser support matrix by adding the property
`browserlist` to your `.sonarrc` file. This property follows the same
convention as [`browserlist`](https://github.com/ai/browserslist):

```json
{
  "browserslist": [
    "> 1%",
    "last 2 versions"
  ]
}
```

By specifying this property, you are giving more information to the rules and
they might decide to adapt their behavior. An example of a rule taking
advantageSome of this property is
[`highest-available-document-mode`](./rules/highest-available-document-mode.md).
This rule will advice you to use `edge` mode if you need to support versions of
IE prior IE10, or tell you to remove that tag or header it you only need IE11+
because document modes were removed at that version.

## Collectors

A `collector` is the interface between the `rule`s and the website
you are testing.

To configure a collector you need to update your `.sonarrc` file to
make it look like the following:

```json
{
    "collector": {
        "name": "collectorName"
    }
}
```

Where `collectorName` is the name of the collector.

`collector`s can be configured as well. Maybe you want to do request
with another `userAgent`, change some of the other defaults, etc. To
do that, you just have to add a property `options` to your `collector`
property with the values you want to modify:

```json
"collector": {
    "name": "collectorName",
    "options": {}
}
```

The [`collector`s documentation](./collectors/index.md) has more information
of what can be configured in each one.

## Formatters

A `formatter` takes the results of executing all the rules and
transforms them to be consumed by the user. A `formatter` can output
the results via the `console` in different formats, a `JSON` file,
`XML`, etc.

Please see [the current list of supported `formatter`s](./formatters/index.md)
to know more.
