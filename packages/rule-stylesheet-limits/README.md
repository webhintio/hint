# Avoid exceeding CSS stylesheet limits (`@sonarwhal/rule-stylesheet-limits`)

Checks if CSS exceeds known stylesheet limits.

## Why is this important?

Internet Explorer prior to version 10 have limits on the
number of CSS stylesheets, imports, and rules which are relatively small
compared to modern browsers. Once these limits are exceeded, additional
stylesheets, imports, and rules are ignored. Much larger limits exist in more
recent versions that can also cause styles to be ignored if exceeded. For more
details see [Stylesheet limits in Internet Explorer][stylesheet limits].

## What does the rule check?

When targeting versions of Internet Explorer less than 10, this rule checks if
one of the following [limits][stylesheet limits] is exceeded:

* 4095 rules
* 31 stylesheets
* 4 levels of imports

When targeting modern browsers, this rule checks if one of the following
[limits in Internet Explorer 10+][stylesheet limits] is exceeded:

* 65535 rules
* 4095 stylesheets

### Examples that **trigger** the rule

* A page targeting Internet Explorer 9 containing 4096 or more CSS rules
* A page targeting Internet Explorer 10 containing 65535 or more CSS rules

### Examples that **pass** the rule

* A page targeting Internet Explorer 9 with fewer than 4096 CSS rules
* A page targeting Internet Explorer 10 and up with fewer than 65535 rules

## Can the rule be configured?

You can overwrite the defaults by specifying custom values for the
number of CSS rules to allow.

In the [`.sonarwhalrc`][sonarwhalrc] file:

```json
{
    "connector": {...},
    "formatters": [...],
    "rules": {
        "stylesheet-limit": ["error", {
            "maxRules": 1000,
            "maxSheets": 10,
            "maxImports": 2
        }],
        ...
    },
    ...
}
```

## How to use this rule?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-stylesheet-limits
```

Note: You can make `npm` install it as a `devDependency` using the `--save-dev`
parameter, or to install it globally, you can use the `-g` parameter. For
other options see
[`npm`'s documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.sonarwhalrc`][sonarwhalrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": [...],
    "rules": {
        "stylesheet-limits": "error",
        ...
    },
    ...
}
```

<!-- Link labels: -->

[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
[stylesheet limits]: https://blogs.msdn.microsoft.com/ieinternals/2011/05/14/stylesheet-limits-in-internet-explorer/
