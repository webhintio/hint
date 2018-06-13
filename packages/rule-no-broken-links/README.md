# Check for broken links (`@sonarwhal/rule-broken-links`)

This rule checks and reports if any links in your page are broken.
This includes anchor tag `href` value and image `src` attribute value.

## Why is this important?

Broken links gives your user a bad user experience.

## What does the rule check?

This rule finds all the anchor tags and image tags in your page and checks
the `href` or the `src` attribute value is valid by issuing a request to
the URL. If the response status is either `404` or `410` or `500` or `503`,
the URL will be flagged as a broken link.

### Examples that **trigger** the rule

#### Absolute URL

`<a href="https://example.com/404">Register</a>`

`<img src="https://example.com/image.png" alt="logo" />`

#### Relative URL

`<a href="/page-does-not-exist">Profile</a>`

`<img src="/image_does_not_exist.png" alt="logo" />`

### Examples that **pass** the rule

URLs which returns 200 OK will pass this rule.

## How to use this rule?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-no-broken-links
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
        "no-broken-links":"error"
    },
    ...
}
```

<!-- Link labels: -->

[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
