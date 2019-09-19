# Use subresource integrity (`sri`)

`sri` warns about requesting scripts or stylesheets without using
subresource integrity.

## Why is this important?

A common practice in modern web development is to use third party
resources from CDNs or different services (analytics, ads, etc.).
However, doing so can increase the attack surface of your web site/app.

While there are techniques to verify the agent is talking with the
right server (TLS, HSTS, etc.), an attacker (or administrator) with
access to the server can manipulate the content with impunity.

> If you want to load a crypto miner on 1,000+ websites you don't
attack 1,000+ websites, you attack the 1 website that they all load
content from.
([Scott Helme][weak link])

Subresource integrity [is a standard][sri spec] that mitigates this
by ensuring that an exact representation of a resource, and only that
representation, loads and executes.

## What does the hint check?

This hint checks that a website correctly uses SRI, more specifically:

* All the downloaded resources by an `<script>` or
  `<link rel="stylesheet">` have an `integrity` attribute.
* [The `integrity` attribute needs to be valid][sri format]. I.e.:
  it should contain something in the form of `sha(256|384|512)-HASH`,
  where `HASH` is the hashed value of the downloaded body's response
  using the previously specified algorithm (`sha256`, `sha384`, or
  `sha512`).
* The minimum cryptographic hash function used is [`sha384`][collisions].
  If multiple ones are provided, the highest one will be used to
  determine if the baseline is met.
* When using a cross-origin resource (e.g.: using a script hosted in
  a third party CDN), the `<script>` or `<link>` tag needs to have a
  valid [`crossorigin` attribute][crossorigin].
* The resource is served on a [secure context][secure context]
  (i.e.: HTTPS) to guarantee the HTML and resource haven't been
  tampered during the delivery.
* The hash from the `integrity` attribute needs to be the same as
  the one calculated using the response's body.
* If multiple hashes are provided, at least one needs to be valid.

### Examples that **trigger** the hint

Cross-origin resource with no `crossorigin` attribute:

```html
<script src="https://example.com/example-framework.js"
  integrity="sha384-Li9vy3DqF8tnTXuiaAJuML3ky+er10rcgNR/VqsVpcw+ThHmYcwiB1pbOxEbzJr7">
</script>
```

Cross-origin resource with invalid `crossorigin` attribute:

```html
<script src="https://example.com/example-framework.js"
  integrity="sha384-Li9vy3DqF8tnTXuiaAJuML3ky+er10rcgNR/VqsVpcw+ThHmYcwiB1pbOxEbzJr7"
  crossorigin="invalid">
</script>
```

Cross-origin resource loaded over `HTTP`:

```html
<script src="http://example.com/example-framework.js"
  integrity="sha384-Li9vy3DqF8tnTXuiaAJuML3ky+er10rcgNR/VqsVpcw+ThHmYcwiB1pbOxEbzJr7"
  crossorigin="invalid">
</script>
```

Same-origin resource with no `integrity` and `originCriteria` set to `all`:

```html
<link rel="stylesheet" href="/style.css">
```

### Examples that **pass** the hint

Cross-origin resource with multiple hashes and `sha384` is one of them:

```html
<script src="https://example.com/script.js"
  integrity="sha256-validHashHere
             sha384-validHashHere">
</script>
```

Cross-origin resource with valid `crossorigin` attribute:

```html
<script src="https://example.com/example-framework.js"
  integrity="sha384-Li9vy3DqF8tnTXuiaAJuML3ky+er10rcgNR/VqsVpcw+ThHmYcwiB1pbOxEbzJr7"
  crossorigin="anonymous">
</script>
```

## Can the hint be configured?

Yes, you can define the baseline algorithm and the origin of the resources
to analyze.

### Baseline algorithm

By default the baseline algorithm is `sha384` but you can
change it to `sha256`, or `sha512` by specifying that in the
[`.hintrc`][hintrc] file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "sri": ["warning", {
            "baseline": "sha512"
        }],
        ...
    },
    ...
}
```

The above will validate that the `integrity` of all scripts and
styles use `sha512`.

### Origin criteria

By default, this hint will analyze only resources with a different origin.
To change this behavior you will have to set the `originCriteria` property
to one of the following:

* `all`: All resources will be analyzed
* `crossOrigin`: Only cross-origin resources will be analyzed

The following will analyze all the resources:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "sri": ["warning", {
            "originCriteria": "all"
        }],
        ...
    },
    ...
}
```

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
        "sri": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [Using Subresource Integrity - by Frederik Braun][using sri]
* [Subresource Integrity specification][sri spec]
* [Protect your site from Cryptojacking with CSP + SRI - by Scott Helme][prevent cryptojacking]
* [SRI Hash Generator][srihash generator]

<!-- Link labels: -->

[collisions]: https://w3c.github.io/webappsec-subresource-integrity/#hash-collision-attacks
[crossorigin]: https://w3c.github.io/webappsec-subresource-integrity/#is-response-eligible
[prevent cryptojacking]: https://scotthelme.co.uk/protect-site-from-cryptojacking-csp-sri/
[secure context]: https://w3c.github.io/webappsec-subresource-integrity/#non-secure-contexts
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[sri format]: https://w3c.github.io/webappsec-subresource-integrity/#resource-integrity
[sri spec]: https://w3c.github.io/webappsec-subresource-integrity/
[srihash generator]: https://www.srihash.org/
[using sri]: https://frederik-braun.com/using-subresource-integrity.html
[weak link]: https://scotthelme.co.uk/protect-site-from-cryptojacking-csp-sri/#theweaklink
