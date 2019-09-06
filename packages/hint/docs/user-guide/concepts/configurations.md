# Configurations

A configuration is a way to share .hintrc values for different use
cases, such as related hints, URLs to ignore, shared organization
standards, etc. When installing a configuration, all of its dependencies
(hints, connectors, formatters, parsers) should be installed
automatically as well.

Conveniently, any configuration you choose when running
`npm create hintrc` is automatically installed _and_ added to your
.hintrc for you.

To add a configuration other than (or in addition to) those offered by
running `npm create hintrc`, first install its package. Make sure the
package name begins with `@hint/configuration-`,
`webhint-configuration-`, or `@scope/webhint-configuration-`. Once
installed, update your .hintrc to use it by adding your new configuration
to the `extends` array. Packages within the `@hint/` namespace (like,
for example, `@hint/configuration-example1`) can be added using their
short name.

```json
{
    "extends": ["example1"]
}
```

Because the property `extends` is an array of strings, you can extend
from multiple configuration packages. For example, if you wish to add
`@hint/configuration-web-recommended`, `webhint-configuration-example2`,
and `@orgname/webhint-configuration-example3`, your `extends` value will
look like this:

```json
{
    "extends": [
        "web-recommended",
        "webhint-configuration-example2",
        "@orgname/webhint-configuration-example3"
    ]
}
```

Configuration priority applies from left to right. Any values in your
own .hintrc file will take precedence over those in an included
configuration package. For example, the following will always use the
`summary` formatter, regardless of the content of
`webhint-configuration-example1` and `webhint-configuration-example2`
configurations: (see Notes for more details)

```json
{
    "extends": [
        "webhint-configuration-example1",
        "webhint-configuration-example2"
    ],
    "formatters": ["summary"]
}
```

Notes:

* If you define the property `formatters` when extending a
  configuration, the formatters in the configuration will be _replaced_
  with the value you have defined.

* If you define the property `parsers` when extending a configuration,
  the parsers in the configuration will be _appended_ to the values you
  have defined.

If you want to implement your own custom configuration, visit the
[contributor guide][].

<!-- Link labels: -->

[contributor guide]: https://webhint.io/docs/contributor-guide/how-to/configuration/
