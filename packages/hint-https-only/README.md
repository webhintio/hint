# Require https for you site and assets (`https-only`)

`https-only` checks if your site is using HTTPS and warns against having
mixed content.

## Why is this important?

HTTPS is important to guarantee content integrity. Even when your site
doesn't have sensitive information, an attacker can change the content
or inject malicious scripts (like a [crypto miner][crypto miner] to
use your user's CPU power).

Also, [certain browser features][certain features] are only available if the
site is on HTTPS.

## What does the hint check?

This hint checks two things:

* The main target is served using HTTPS
* If the main target is an HTML file, all its resources should be on HTTPS too
* If there are any redirects accessing the resources, it will validate all of
  them are done over HTTPS

### Examples that **trigger** the hint

If your site is not served using HTTPS.

```bash
hint http://example.com
```

If your site is served using HTTPS, but one or more resources use HTTP.

```html
<body>
    <img src="http://example.com/image.png" />
    <script src="http://example.com/script.js"></script>
</body>
```

### Examples that **pass** the hint

Your site is served using HTTPS and its resources too.

```html
<body>
    <img src="https://example.com/image.png" />
    <script src="https://example.com/script.js"></script>
</body>
```

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-https-only
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
        "https-only": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

## Further Reading

* [Yes your site needs HTTPS][needs https]
* [MDN Mixed Content][mixed content]
* [W3C Mixed Content spec][spec]

[crypto miner]: https://scotthelme.co.uk/protect-site-from-cryptojacking-csp-sri/
[mixed content]: https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content
[needs https]: https://doesmysiteneedhttps.com/
[certain features]: https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts/features_restricted_to_secure_contexts
[spec]: https://w3c.github.io/webappsec-mixed-content/
