# No vulnerable libraries (`@sonarwhal/rule-no-vulnerable-javascript-libraries`)

This rule checks for known vulnerabilities within client-side JavaScript
libraries and frameworks detected on a web site.

Sonarwhal uses Snyk’s [Vulnerability DB][snykdb] service to lookup
published vulnerabilities.

## Why is this important?

Making sure your website dependencies are free of known vulnerabilities
is important in preventing malicious attacks like [Cross-site Scripting][XSS]
used to compromise web site information.

## How to use this rule?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-no-vulnerable-javascript-libraries
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
        "no-vulnerable-javascript-libraries": "error"
    },
    ...
}
```

## What does the rule check?

This rules uses Snyk’s [Vulnerability DB][snykdb] and
[js-library-detector][js-library-detector] to check if the
website is running a vulnerable version of a client-side JavaScript
library or framework.

The vulnerability database is updated automatically from [Snyk][snykdb]
if the cached content is older than 24h.

## Can the rule be configured?

You can configure the minimum severity to report in the
[`.sonarwhalrc`][sonarwhalrc] file:

```json
{
    "connector": {...},
    "formatters": [...],
    "rules": {
        "no-vulnerable-libraries": ["error", {
            "severity": "low|medium|high"
        }],
        ...
    },
    ...
}
```

The `severity` possible values are: `low` (default), `medium`,
and `high`.

If you configure this rule to `high`, and `sonarwhal` only finds
`low` or `medium` vulnerabilities, no issues will be raised.

## Further Reading

* [77% of sites use at least a vulnerable JavaScript library][77 vulnerable]
* [Thou shalt not depend on me: analysing the use of outdated JavaScript
   libraries on the web][not depend on me]

<!-- Link labels: -->

[77 vulnerable]: https://snyk.io/blog/77-percent-of-sites-use-vulnerable-js-libraries/
[js-library-detector]: https://npmjs.com/package/js-library-detector
[not depend on me]: https://blog.acolyer.org/2017/03/07/thou-shalt-not-depend-on-me-analysing-the-use-of-outdated-javascript-libraries-on-the-web/
[snykdb]: https://snyk.io/vuln/
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
[XSS]: https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting
