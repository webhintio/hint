# No protocol-relative URLs (`no-protocol-relative-urls`)

`no-protocol-relative-urls` warns against using scheme-relative URLs
(commonly known as protocol-relative URLs).

## Why is this important?

A shorthand way of specifying URLs is to remove the protocol and
let the browser determine the relative protocol based on the current
connection to the resource.

As the web moves [towards HTTPS everywhere][https only web],
the use of [protocol-relative URLs][protocol-relative urls] has
become an anti-pattern, exposing some sites to man in the middle
compromises and is therefore best avoided.

Particularly for web sites/apps served over HTTP, other drawbacks
when using protocol relative URLs include:

* Performance

  * If the web site/app is served over HTTP, for every
    protocol-relative URL that does support HTTPS and:

    * does a redirect to it (i.e. most CDNs), the load time will take
      longer than if the request was made directly to the `https://`
      version of the URL.

    * does not redirect to it, you may be missing out on things
      such as Brotli compression and HTTP/2 that are only supported
      by browsers over HTTPS.

* Security

  If protocol-relative URLs are used for CDN links, their
  domain is not in the browser’s [HSTS preload list][hsts preload
  list], and the first request is not made over HTTP, there is a
  high risk of man-in-the-middle attacks.

  Of course, if the web site/app is served over HTTP it is already
  exposed to those types of attacks, but in general CDNs constitute
  a high-value target, and therefore, are much more likely to be
  attacked than most of the individual sites that use them.

## What does the hint check?

The hint checks for protocol-relative URLs.

Note: Currently the hint does not check for protocol-relative URLs
inside of stylesheets and scripts.

Let’s presume `example1.com` does not support HTTPS and `example2.com`
does.

### Examples that **trigger** the hint

```html
<link rel="stylesheet" href="//example1.com/style.css">
```

```html
<script src="//example2.com/script.js"></script>
```

### Examples that **pass** the hint

```html
<link rel="stylesheet" href="http://example1.com/style.css">
```

```html
<script src="https://example2.com/script.js"></script>
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
        "no-protocol-relative-urls": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [The protocol-relative URL][protocol-relative urls]
* [Moving CDNs to HTTPS](https://github.com/konklone/cdns-to-https#readme)

<!-- Link labels: -->

[hsts preload list]: https://hstspreload.org
[https only web]: https://w3ctag.github.io/web-https/#h-motivating-a-secure-web
[ie issue]: https://www.stevesouders.com/blog/2010/02/10/5a-missing-schema-double-download/
[protocol-relative urls]: https://www.paulirish.com/2010/the-protocol-relative-url/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
