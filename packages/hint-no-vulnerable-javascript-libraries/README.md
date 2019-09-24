# No vulnerable libraries (`no-vulnerable-javascript-libraries`)

`no-vulnerable-javascript-libraries` checks for known vulnerabilities
within client-side JavaScript libraries and frameworks detected on a
web site.

`webhint` uses Snyk’s [Vulnerability DB][snykdb] to lookup known
vulnerabilities.

## Why is this important?

Making sure your website dependencies are free of known
vulnerabilities is important in preventing malicious attacks such as
[cross-site scripting][XSS] attacks that can be used to compromise web
site information.

## What does the hint check?

This hint uses Snyk’s [Vulnerability DB][snykdb] and
[js-library-detector][js-library-detector] to check if the
website is running a vulnerable version of a client-side JavaScript
library or framework.

The vulnerability database is updated automatically from [Snyk][snykdb]
if the cached content is older than 24h.

## Can the hint be configured?

You can configure the minimum severity to report in the
[`.hintrc`][hintrc] file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "no-vulnerable-javascript-libraries": ["error", {
            "severity": "low|medium|high"
        }],
        ...
    },
    ...
}
```

The `severity` possible values are: `low` (default), `medium`,
and `high`.

If you configure this hint to `high`, and `webhint` only finds
`low` or `medium` vulnerabilities, no issues will be raised.

## How to use this hint?

This package is installed automatically by webhint:

```bash
npm install hint --save-dev
```

To use it, activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "no-vulnerable-javascript-libraries": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [77% of sites use at least a vulnerable JavaScript library][77 vulnerable]
* [Thou shalt not depend on me: analysing the use of outdated JavaScript
   libraries on the web][not depend on me]

<!-- Link labels: -->

[77 vulnerable]: https://snyk.io/blog/77-percent-of-sites-use-vulnerable-js-libraries/
[js-library-detector]: https://npmjs.com/package/js-library-detector
[not depend on me]: https://blog.acolyer.org/2017/03/07/thou-shalt-not-depend-on-me-analysing-the-use-of-outdated-javascript-libraries-on-the-web/
[snykdb]: https://snyk.io/vuln/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[XSS]: https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting
