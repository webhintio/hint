# Avoid exceeding CSS stylesheet limits (`@sonarwhal/rule-stylesheet-limits`)

Checks if CSS exceeds known stylesheet limits.

## Why is this important?

Internet Explorer 9 and below have limits on the number of CSS stylesheets,
imports, and rules which are relatively small compared to modern browsers.
Once these limits are exceeded, additional stylesheets, imports, and rules
are ignored. For more details see
[_"Stylesheet limits in Internet Explorer"_][stylesheet limits].

Similar behavior existed in older versions of other browsers, such as
[Chrome][chrome limits]. Newer browsers have much higher limits such as
65535 rules in [Internet Explorer 10+ and Edge][stylesheet limits].

Even in modern browsers large numbers of CSS selectors can negatively impact
performance. You [can customize](#can-the-rule-be-configured) this rule and
set appropriate limits for your project or team.

## What does the rule check?

When targeting versions of Internet Explorer 9 and below, this rule checks if
one of the following [limits][stylesheet limits] is exceeded:

* 4095 rules
* 31 stylesheets
* 4 levels of imports

### Examples that **trigger** the rule

* A page targeting Internet Explorer 9 containing 4096 or more CSS rules

### Examples that **pass** the rule

* A page targeting Internet Explorer 9 with fewer than 4096 CSS rules
* A page not targeting Internet Explorer 9 or below regardless of the number
  of CSS rules

## Can the rule be configured?

You can overwrite the defaults by specifying custom values for the
number of CSS rules to allow. Note if the custom values are above
the default values, the default values will still be used.

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
[chrome limits]: https://stackoverflow.com/questions/20828995/how-long-can-a-css-selector-be]
