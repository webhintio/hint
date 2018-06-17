# Check for broken links (`@sonarwhal/rule-broken-links`)

This rule checks and reports if any links in your page are broken.
This includes anchor tag `href` value, image `src` value,
script `src` value, video `src` value etc.

## Why is this important?

Broken links gives your user a bad user experience.

## What does the rule check?

This rule gets executed on all the below elements.

1. `img` - checks `src` and `srcset` attribute values
2. `script`- checks for `src` attribute value
3. `anchor` - checks for `href` attribute value
4. `audio` - checks for `src` attribute value
5. `video` - checks for `src` and `poster` attribute values
6. `source` - checks for `src` attribute value
7. `object` - checks for `data` value attribute value
8. `link` - checks for `src` attribute value
9. `track` - checks for `src` attribute value

If the response status of the resource link is either `404` or `410`
or `500` or `503`, the URL will be flagged as a broken link.

### Examples that **trigger** the rule

#### Absolute URL

`<a href="https://example.com/404">Register</a>`

`<img src="https://example.com/image.png" alt="logo">`

#### Relative URL

`<a href="/page-does-not-exist">Profile</a>`

`<img src="/image_does_not_exist.png" alt="logo"/>`

### Examples that **pass** the rule

URLs which return 200 OK will pass this rule.

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
        "no-broken-links": "error"
    },
    ...
}
```

<!-- Link labels: -->

[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
