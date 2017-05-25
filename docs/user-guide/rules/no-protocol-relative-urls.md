# Disallow protocol-relative URLs (`no-protocol-relative-urls`)

`no-protocol-relative-urls` warns against using scheme-relative URLs
(commonly known as protocol-relative URLs).

## Why is this important?

Nowadays the tendency of the [web is to move to
HTTPS](https://w3ctag.github.io/web-https/#h-motivating-a-secure-web),
so the use of [protocol-relative URLs](https://www.paulirish.com/2010/the-protocol-relative-url/)
has become an anti-pattern.

Particularly for web sites/apps served over HTTP, using protocol-relative
URLs can have some drawbacks, which among other include:

* Performance

  * If the web site/app is served over HTTP, for every
    protocol-relative URL that does support HTTPS and:

    * does redirect to it (i.e. most CDNs) the load time will take
      longer than if the request was made directly to the `https://`
      version of the URL.

    * does not redirect to it, you may be missing out on things
      such as Brotli compression and HTTP/2 that are only supported
      by browsers over HTTPS.

  * [Internet Explorer 7 and 8 will download a stylesheet twice if
    protocol-relative URLs are used for `<link>`s or
    `@import`s](https://www.stevesouders.com/blog/2010/02/10/5a-missing-schema-double-download/).

* Security

  Especially if protocol-relative URLs are used for CDN links, their
  domain is not in the browser's [HSTS preload list](https://hstspreload.org/),
  and the first request is not made over HTTP, there is a high risk
  of man-in-the-middle attacks.

  Of course if the web site/app is served over HTTP it is already
  exposed to those types of attacks, but in general CDNs constitute
  a high-value target, and therefore, are much more likely to be
  attacked than most of the individual sites that use them.

## What does the rule check?

The rule checks for protocol-relative URLs.

Note: Currently the rule does not check for protocol-relative URLs
inside of stylesheets and scripts.

Let's presume `example1.com` does not support HTTPS and `example2.com`
does.

### Examples that **trigger** the rule

```html
<link rel="stylesheet" href="//example1.com/style.css">
```

```html
<script src="//example2.com/script.js"></script>
```

### Examples that **pass** the rule

```html
<link rel="stylesheet" href="http://example1.com/style.css">
```

```html
<script src="https://example2.com/script.js"></script>
```

## Further Reading

* [The protocol-relative URL](https://www.paulirish.com/2010/the-protocol-relative-url/)
* [Moving CDNs to HTTPS](https://github.com/konklone/cdns-to-https#readme)
