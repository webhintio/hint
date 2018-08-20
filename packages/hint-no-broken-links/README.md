# Check for broken links (`broken-links`)

This hint checks and reports if any links in your page are broken.
This includes anchor tag `href` value, image `src` value,
script `src` value, video `src` value etc.

## Why is this important?

Broken links gives your user a bad user experience.

## What does the hint check?

This hint gets executed on all the below elements.

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

## Can the hint be configured?

Yes. You can change the http method to make the
requests (`HEAD`, `GET`, etc.).
To do so, you need to configure the property `method` in your configuration
[`.hintrc`][hintrc] file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "no-broken-links": ["error", {
            "method": "GET|HEAD"
        }],
        ...
    },
    ...
}
```

By default, this hint will use the http method `GET` to request
the urls.

### Examples that **trigger** the hint

#### Absolute URL

`<a href="https://example.com/404">Register</a>`

`<img src="https://example.com/image.png" alt="logo">`

#### Relative URL

`<a href="/page-does-not-exist">Profile</a>`

`<img src="/image_does_not_exist.png" alt="logo">`

### Examples that **pass** the hint

URLs which return 200 OK will pass this hint.

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-no-broken-links
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
        "no-broken-links": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/
