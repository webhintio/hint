# AMP HTML Validator (`@sonarwhal/rule-amp-validator`)

> AMP HTML is a way to build web pages that render with reliable and
fast performance. It is our attempt at fixing what many perceive as
painfully slow page load times – especially when reading content on
the mobile web. AMP HTML is built on existing web technologies; an
AMP page will load (quickly) in any modern browser.

***From [AMPProject - AMP HTML][ampproject]***

## Why is this important?

If you are building an AMP page, you need to make sure the HTML is valid.
Only valid AMP content can be added to an [AMP Cache][amp-cache].

## How to use this rule?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-amp-validator
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
        "amp-validator": "error"
    },
    ...
}
```

## What does the rule check?

This rule uses [amphtml-validator][amphtml-validator] to validate the
HTML of your page.

## Can the rule be configured?

Yes, you can decide if you want to receive errors only, or also
warnings found by [`amphtml-validator`][amphtml-validator].
By default all warnings and errors are reported. If you prefer to
see only the errors you can use the following rule configuration
in your [`.sonarwhalrc`][sonarwhalrc] file:

```json
{
    "connector": {...},
    "formatters": [...],
    "rules": {
        "amp-validator": ["error", {
            "errorsOnly": true
        }],
        ...
    },
    ...
}
```

## Further Reading

* [What is AMP][amp]
* [How AMP Works][amp-works]

<!-- Link labels: -->

[amp-cache]: https://www.ampproject.org/docs/guides/how_cached
[amp-works]: https://www.ampproject.org/learn/about-how/
[amp]: https://www.ampproject.org/learn/overview/
[amphtml-validator]: https://www.npmjs.com/package/amphtml-validator
[ampproject]: https://github.com/ampproject/amphtml
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
