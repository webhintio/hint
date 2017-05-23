# User guide

## Getting started

Getting started with sonar's CLI is really easy. First you need to install it:

```bash
npm install -g @sonarwhal/sonar
```

You can also install it as a `devDependency` if you prefer not to have it
globally.

The next thing that sonar needs is a `.sonarrc` file. The fastest and easiest
way to create one is by using the flag `--init`:

```bash
sonar --init
```

This command will start a wizard that will ask you a series of questions (what
collector to use, what formatter, which rules, etc.). Answer them and you will
end up with something similar to the following:

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
    }
}
```

## Rules

A `rule` is a test that your website needs to pass. Sonar comes with a few
[built in ones](./rules/), but you can easily create your own or download them
from `npm`.

### Rule configuration

Rule severity can be one of the following:

* `off`: The rule will not be executed. This is the same as not having the rule
  under the `rules` section of a `.sonarrc` file.
* `warning`: The rule will be executed but it will not change the exit status
  code if an issue is found.
* `error`: The rule will be executed and will change the exit status code to `1`
  if an issue is found.

Additionally, some rules allow further customization. The configuration in that
case it will be similar to the following:

```json
"rules": {
    "rule1": ["severity", {
        "customization1": "value1",
        "customization2": "value2"
    }]
}
```

You can check which rules accept this kind of configuration by visiting the
[rules documentation](./rules/).

Sometimes you want to enable a rule but not for all the domains a website
depends on. For example, if your website loads some external library from a CDN
you might not have control over the `header`s sent. To disable some rules for
just some specific domains you need to add a `ignoredUrls` to your `.sonarrc`
file:

```json
"ignoredUrls": {
    ".*\\.domain1\\.com/.*": ["*"], //Apply to all the rules, events won't be emitted for that urls
    "www.domain2.net": ["disallowed-headers"] //Just apply to the rule disallowed-headers
}
```

Properties can be:

* regular expressions, like `.*\\.domain1\\.com/.*`. This will match:
  * `something.domain1.com/index.html`
  * `somethingelse.domain1.com/image.png`
* some text, like `www.domain2.net`. In this case, if the resource url contains
  the text, it will be a match. E.g.:
  * `www.domain2.net/index.php`
  * `www.domain2.net/image.png`

The value of the property has to be an array of strings where the strings can be:

* `*` if you want to ignore all rules for the given domain.
* the ID of the rule to be ignored

In the previous example we will:

* Ignore all rules for any resource that matches the regex `.*\\.domain1\\.com/.*`.
* Ignore the rule `disallowed-headers` for the domain `www.domain2.net`.

## Collectors

A `collector` is the interface between the `rule`s and the website you are
testing. Sonar currently supports the following `collector`s:

To configure a collector you need to update your `.sonarrc` file to make it look
like the following:

```json
"collector": {
    "name": "collectorName"
}
```

Where `collectorName` is the name of the collector.

`collector`s can be configured as well. Maybe you want to do request with
another `userAgent`, change some of the other defaults, etc. To do that, you
just have to add a property `options` to your `collector` property with the
values you want to modify:

```json
"collector": {
    "name": "collectorName",
    "options": {}
}
```

The [`collector`s documentation](./collectors/) has more information of what
can be configured in each one.

## Formatters

A `formatter` takes the results of executing all the rules and transforms them to
be consumed by the user. A `formatter` can output the results via the `console` in
different formats, a `JSON` file, `XML`, etc.
Please see [the current list of supported `formatter`s](./formatters/) to know
more.
