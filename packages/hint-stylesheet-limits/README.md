# Avoid exceeding CSS stylesheet limits (`stylesheet-limits`)

`stylesheet-limits` checks if CSS exceeds known stylesheet limits.

## Why is this important?

Internet Explorer 9 and below have limits on the number of CSS stylesheets,
imports, and rules which are relatively small compared to modern browsers.
Once these limits are exceeded, additional stylesheets, imports, and rules
are ignored. For more details see [_"Stylesheet limits in Internet
Explorer"_][stylesheet limits].

Similar behavior existed in older versions of other browsers, such as
[Chrome][chrome limits]. Newer browsers have much higher limits such as
65535 rules in [Internet Explorer 10+ and Edge][stylesheet limits].

Even in modern browsers large numbers of CSS selectors can negatively
impact performance. You [can customize](#can-the-hint-be-configured)
this hint and set appropriate limits for your project or team.

## What does the hint check?

When targeting versions of Internet Explorer 9 and below, this hint
checks if one of the following [limits][stylesheet limits] is exceeded:

* 4095 rules
* 31 stylesheets
* 4 levels of imports

### Examples that **trigger** the hint

* A page targeting Internet Explorer 9 containing 4096 or more CSS rules.

### Examples that **pass** the hint

* A page targeting Internet Explorer 9 with fewer than 4096 CSS rules.
* A page not targeting Internet Explorer 9 or below regardless of the
  number of CSS rules.

## Can the hint be configured?

You can overwrite the defaults by specifying custom values for the
number of CSS rules to allow. Note that if the custom values are above
the default values, the default values will still be used.

In the [`.hintrc`][hintrc] file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
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

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-stylesheet-limits
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "stylesheet-limits": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

<!-- Link labels: -->

[chrome limits]: https://stackoverflow.com/questions/20828995/how-long-can-a-css-selector-be]
[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
[stylesheet limits]: https://blogs.msdn.microsoft.com/ieinternals/2011/05/14/stylesheet-limits-in-internet-explorer/
