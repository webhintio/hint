# Require resources to be served compressed (`http-compression`)

`http-compression` warns against not serving resources compressed when
requested as such using the most appropriate encoding.

## Why is this important?

One of the fastest and easiest ways one can improve the web site's/app's
performance is to reduce the amount of data that needs to get delivered
to the client by using HTTP compression. This not only [reduces the data
used by the user][wdmsc], but can also significallty cut down on the
server costs.

However, there are a few things that need to be done right in order for
get the most out of compression:

* Only compress resources for which the result of the compression
  will be smaller than original size.

  In general text-based resources (HTML, CSS, JavaScript, SVGs, etc.)
  compresss very well especially if the file is not very small.
  The same goes for some other file formats (e.g.: ICO files, web fonts
  such as EOT, OTF, and TTF, etc.)

  However, compressing resources that are already compressed (e.g.:
  images, audio files, PDFs, etc.) not only waste CPU resources, but
  usually result in little to no reduction, or in some cases even
  a bigger file size.

  The same goes for resources that are very small because of the
  overhead of compression file formats.

* Use most efficien compression method.

  `gzip` is the most used encoding nowadays as it strikes a good
  balance between compression ratio (as [high as 70%][gzip ratio]
  especially for larger files) and encoding time, and is supported
  pretty much everywhere.

  Better savings can be achieved using [`Zopfli`][zopfli] which
  can reduce the size on average [3–8% more than `gzip`][zopfli
  blog post]. Since `Zopfli` output (for the `gzip` option) is valid
  `gzip` content, `Zopfli` works eveywere `gzip` works. The only
  downsize is that encoding takes more time than with `gzip`, thus,
  making `Zopfli` more suitable for static content (i.e. encoding
  resources as part of build script, not on the fly).

  But, things can be improved even futher using [Brotli][brotli].
  This encoding allows to get [20–26% higher compression ratios][brotli
  blog post] even over `Zopfli`. However, this encoding is not compatible
  with `gzip`, limiting the support to modern browsers and its usage to
  [only over HTTPS (as proxies misinterpreting unknown encodings)][brotli
  over https].

  So, in general, for best performance and interoperability resources
  should be served compress with `Zopfli`, and `Brotli` over HTTPS with
  a fallback to `Zopfli` if not supported HTTPS.

* Avoid using deprecated or not widlly supported compression formats,
  and `Content-Type` values.

  Avoid using deprecated `Content-Type` values such as `x-gzip`. Some
  user agents may alias them to the correct, current equivalent value
  (e.g.: alias `x-gzip` to `gzip`), but that is not always true.

  Also avoid using encoding that are not widely supported (e.g.:
  `compress`, `bzip2`, [`SDCH`][unship sdch], etc.), and/or may not
  be as efficient, or can create problems (e.g.: [`deflate`][deflate
  issues]). In general these should be avoided, and one should just
  stick to the encoding specified in the previous point.

* Avoid potential caching related issues.

  When resources are served compressed, they should be served with
  the `Vary` header containing the `Accept-Encoding` value (or with
  something such as `Cache-Control: private` that prevents caching
  in proxy caches and such altogether).

  This needs to be done in order to avoid problems such as an
  intermediate proxy caching the compress version of the resource and
  then sending it to all user agents regardless if they support that
  particular encoding or not, or if they even want the compressed
  version or not.

* Resources should be served compressed only when requested as such,
  appropriately encoded, and without relying on user agent sniffing.

  The `Accept-Encoding` request header specified should be respected.
  Sending a content encoded with a different encoding than one of the
  ones accepted can lead to problems.

* Dealing with special cases.

  One such special case are `SVGZ` files that are just `SVG` files
  compressed with `gzip`. Since they are already compressed, they
  shouldn't be compressed again. However sending them without the
  `Content-Encoding: gzip` header will create problems as user agents
  will not know they need to decompress them before displaying them,
  and thus, try to display them directly.

## What does the rule check?

The rule checks for the use cases previously specified, namely, it
checks that:

* Only resources for which the result of the compression is smaller
  than original size are served compressed.

* The most efficient encodigs are used (by default the rule check if
  `Zopfli` is used over HTTP and Brotli over `HTTPS`, however that can
  be changed, see: [`Can the rule be configured?`
  section](#can-the-rule-be-configured)).

* Deprecated or not widely supported encodigs, and `Content-Type`
  values are not used.

* Potential caching related issues are avoided.

* Resources are served compressed only when requested as such, are
  appropriately encoded, and no user sniffing is done.

* Special cases (such as `SVGZ`) are handled correctly.

### Examples that **trigger** the rule

Resource that should be compressed is not served compressed.

e.g.: When the request for `https://example.com/example.js` contains

```text
...
Accept-Encoding: gzip, deflate, br
```

response is

```text
HTTP/... 200 OK

...
Content-Type: text/javascript

<file content>
```

Resource that should not be compressed is served compressed.

e.g.: When the request for `https://example.com/example.png` contains

```text
...
Accept-Encoding: gzip, deflate, br
```

response is

```text
HTTP/... 200 OK

...
Content-Encoding: br
Content-Type: image/png
Vary: Accept-Encoding

<file content compressed with Brotli>
```

Resource that compressed results in a bigger or equal size to the
uncompressed size is still served compressed.

e.g.: For `http://example.com/example.js` containing only `const x = 5;`,
using the defaults, the sizes may be as follows.

```text
origina size: 13 bytes

gzip size:    38 bytes
zopfli size:  33 bytes
brotli size:  17 bytes
```

When the request for `http://example.com/example.js` contains

```text
...
Accept-Encoding: gzip, deflate
```

response is

```text
HTTP/... 200 OK

...
Content-Encoding: gzip
Content-Type: text/javascript
Vary: Accept-Encoding

<file content compressed with gzip>
```

Resource that should be compressed is served compressed with deprecated
or disallowed compression method or `Content-Encoding` value.

e.g.: When the request for `http://example.com/example.js` contains

```text
...
Accept-Encoding: gzip, deflate
```

response contains deprecated `x-gzip` value for `Content-Encoding`

```text
HTTP/... 200 OK

...
Content-Encoding: x-gzip
Content-Type: text/javascript
Vary: Accept-Encoding

<file content compressed with gzip>
```

response is compressed with disallowed `compress` compression method

```text
HTTP/... 200 OK

...
Content-Encoding: compress
Content-Type: text/javascript
Vary: Accept-Encoding

<file content compressed with compress>
```

or response tries to use deprecated SDCH

```text
HTTP/... 200 OK

...
Content-Encoding: gzip,
Content-Type: text/javascript
Get-Dictionary: /dictionaries/search_dict, /dictionaries/help_dict
Vary: Accept-Encoding

<file content compressed with gzip>
```

Resource that should be compressed is not served compressed using
`Zopfli` over HTTP.

e.g.: When the request for `http://example.com/example.js` contains

```text
...
Accept-Encoding: gzip, deflate
```

response is

```text
HTTP/... 200 OK

...
Content-Encoding: gzip
Content-Type: text/javascript
Vary: Accept-Encoding

<content compressed with gzip>
```

Resource that should be compressed is served compressed using `Brotli`
over HTTP.

e.g.: When the request for `http://example.com/example.js` contains

```text
...
Accept-Encoding: gzip, deflate, br
```

response is

```text
HTTP/... 200 OK

...
Content-Encoding: br
Content-Type: text/javascript
Vary: Accept-Encoding

<content compressed with Brotli>
```

Resource that should be compressed is not served compressed using
`Brotli` over HTTPS.

e.g.: When the request for `https://example.com/example.js` contains

```text
...
Accept-Encoding: gzip, deflate, br
```

response is

```text
HTTP/... 200 OK

...
Content-Encoding: gzip
Content-Type: text/javascript
Vary: Accept-Encoding

<content compressed with Zopfli>
```

Resource that is served compressed doesn't account for caching
(e.g: is not served with the `Vary` header with the `Accept-Encoding`
value included, or something such as `Cache-Control: private`).

e.g.: When the request for `https://example.com/example.js` contains

```text
...
Accept-Encoding: gzip, deflate, br
```

response is

```text
HTTP/... 200 OK

...
Content-Encoding: br
Content-Type: text/javascript

<content compressed with Brotli>
```

Resource is blindly served compressed using `gzip` no matter what the
user agent advertises as supporting.

E.g.: When the request for `https://example.com/example.js` contains

```text
...
Accept-Encoding: br
```

response is

```text
HTTP/... 200 OK

...
Content-Encoding: gzip
Content-Type: text/javascript
Vary: Accept-Encoding

<content compressed with gzip>
```

Resource is served compressed only for certain user agents.

E.g.: When the request for `https://example.com/example.js` contains

```text
...
Accept-Encoding: gzip, deflate, br
User-Agent: Mozilla/5.0 Gecko
```

response is

```text
HTTP/... 200 OK

...
Content-Type: text/javascript

<file content>
```

however when requested with

```text
...
Accept-Encoding: gzip, deflate, br
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:57.0) Gecko/20100101 Firefox/57.0
```

response is

```text
HTTP/... 200 OK

...
Content-Encoding: br
Content-Type: text/javascript
Vary: Accept-Encoding

<content compressed with Brotli>
```

`SVGZ` resource is not served with `Content-Encoding: gzip` header:

E.g.: When the request for `https://example.com/example.svgz` contains

```text
...
Accept-Encoding: gzip, deflate, br
```

response is

```text
HTTP/... 200 OK

...
Content-Type: image/svg+xml

<file content>
```

### Examples that **pass** the rule

Resource that should be compressed is served compressed using `Zopfli`
over HTTP and with the `Vary: Accept-Encoding` header.

e.g.: When the request for `http://example.com/example.js` contains

```text
...
Accept-Encoding: gzip, deflate
```

response is

```text
HTTP/... 200 OK

...
Content-Encoding: gzip
Content-Type: text/javascript
Vary: Accept-Encoding

<content compressed with Zopfli>
```

Resource that should be compressed is served compressed using `Brotli`
over HTTPS and with the `Vary: Accept-Encoding` header.

e.g.: When the request for `https://example.com/example.js` contains

```text
...
Accept-Encoding: gzip, deflate, br
```

response is

```text
HTTP/... 200 OK

...
Content-Encoding: br
Content-Type: text/javascript
Vary: Accept-Encoding

<content compressed with Brotli>
```

Resource that should not be compressed is not served compressed.

e.g.: When the request for `https://example.com/example.png` contains

```text
...
Accept-Encoding: gzip, deflate, br
```

response is

```text
HTTP/... 200 OK

...
Content-Type: image/png

<image content>
```

`SVGZ` resource is served with `Content-Encoding: gzip` header:

e.g.: When the request for `https://example.com/example.svgz` contains

```text
...
Accept-Encoding: gzip, deflate, br
```

response is

```text
HTTP/... 200 OK

...
Content-Encoding: gzip
Content-Type: image/svg+xml

<SVGZ content>
```

## Can the rule be configured?

You can override the defaults by specifying what type of compression
you don't want the rule to check for. This can be done for the `target`
(main page) and/or the `resources` the rule determines should be served
compressed, using the following format:

```json
"http-compression": [ "warning", {
    "resource": {
        "<compression_type>": <true|false>,
        ...
    },
    "target": {
        "<compression_type>": <true|false>,
        ...
    }
}
```

Where `<compression_method>` can be one of: `brotli`, `gzip`, or
`zopfli`.

E.g. If you want the rule to check if only the page resources are
served compressed using `Brotli`, and not the page itself, you can
use the following configuration:

```json
"http-compression": [ "warning", {
    "target": {
        "brotli": false
    }
}]
```

Note: You can also use the [`ignoredUrls`](../index.md#rule-configuration)
property from the `.sonarwhalrc` file to exclude domains you don’t control
(e.g.: CDNs) from these checks.

<!-- Link labels: -->

[brotli blog post]: https://opensource.googleblog.com/2015/09/introducing-brotli-new-compression.html
[brotli over https]: https://medium.com/@yoavweiss/well-the-technical-reason-for-brotli-being-https-only-is-that-otherwise-there-s-a-very-high-508f15f0ad95
[brotli]: https://github.com/google/brotli
[deflate issues]: https://stackoverflow.com/questions/9170338/why-are-major-web-sites-using-GZIP/9186091#9186091
[gzip is not enough]: https://www.youtube.com/watch?v=whGwm0Lky2s
[gzip ratio]: https://www.youtube.com/watch?v=Mjab_aZsdxw&t=24s
[unship sdch]: https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/nQl0ORHy7sw
[wdmsc]: https://whatdoesmysitecost.com/
[zopfli blog post]: https://developers.googleblog.com/2013/02/compress-data-more-densely-with-zopfli.html
[zopfli]: https://github.com/google/zopfli
