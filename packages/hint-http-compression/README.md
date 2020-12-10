# Optimal compression (`http-compression`)

`http-compression` warns against serving resources uncompressed
or using an inappropriate encoding.

## Why is this important?

One of the fastest and easiest ways one can improve web site/app
performance is to reduce the amount of data sent to the client
by using HTTP compression. This not only [reduces the data used by
the user][wdmsc], but can also significantly cut down on the server
costs.

Here are a few rules to follow to get the most out of compressing
resources:

* Only compress resources for which the result of the compression
  will be smaller than original size.

  In general text-based resources (HTML, CSS, JavaScript, SVGs, etc.)
  compress very well especially if the file is not very small.
  The same goes for some other file formats (e.g.: ICO files, web fonts
  such as EOT, OTF, and TTF, etc.)

  However, compressing resources that are already compressed (e.g.:
  images, audio files, PDFs, etc.) not only wastes CPU resources, but
  usually results in little to no reduction, or in some cases, results
  in an increase in file size.

  The same applies to resources that are very small because of the
  overhead of compression file formats.

* Use the most efficient compression method.

  gzip is the most used encoding method currently as it strikes a
  good balance between compression ratio (as [high as 70%][gzip ratio]
  especially for larger files) and encoding time and is supported
  pretty much everywhere.

  Better savings can be achieved using [Zopfli][zopfli] which
  can reduce the size on average [3–8% more than gzip][zopfli
  blog post]. Since Zopfli output (for the gzip option) is valid
  gzip content, Zopfli works everywhere gzip works. The only down
  side is that encoding takes more time than gzip, making Zopfli
  more suitable for static content (i.e. encoding resources as part
  of a build script, not on the fly).

  Things can be improved even further using [Brotli][brotli].
  This encoding can achieve [20–26% higher compression ratios][brotli
  blog post] over Zopfli. However, this encoding is not compatible
  with gzip, limiting the support to modern browsers and its usage to
  [only over HTTPS (as proxies misinterpret unknown encodings)][brotli
  over https].

  As a rule, for best performance and compatibility, resources
  should be served compressed with Zopfli over insecure HTTP, and
  Brotli when sending over HTTPS with a fallback to Zopfli if HTTPS
  is not supported.

* Avoid using deprecated or not widely supported compression formats,
  and `Content-Type` values.

  Avoid using deprecated `Content-Type` values such as `x-gzip`. Some
  user agents may alias them to the correct, current equivalent value
  (e.g.: alias `x-gzip` to gzip), but that is not always true.

  Also avoid using encodings that are not widely supported (e.g.:
  `compress`, `bzip2`, [`sdch`][unship sdch], etc.), and/or may not
  be as efficient, or can create problems (e.g.: [`deflate`][deflate
  issues]).

* Avoid potential caching related issues.

  When resources are served compressed, they should be served with
  the `Vary` header containing the `Accept-Encoding` value (or with
  something such as `Cache-Control: private` that prevents caching
  in proxy caches and such altogether).

  This needs to be done to avoid problems such as an intermediate proxy
  caching the compressed version of the resource and then sending it
  to all user agents, whether they support that encoding
  or even requested the compressed version.

* Resources should be served compressed only when requested as such,
  appropriately encoded, and without relying on user agent sniffing.

  The `Accept-Encoding` request header specified should be respected.
  Sending a resource encoded with a different encoding than one of the
  ones accepted can lead to problems.

  Here are some examples:

  * If the user agent makes a request containing the [`Accept-Encoding:
    identity`][identity] header, that means it wants the response to
    not be transformed in any way, so the server should send the data
    uncompress.

  * If the user agent makes a request containing the `Accept-Encoding:
    gzip, br` header, that means it wants the response to either be
    uncompress or compress with one of the specified encodings, namely:
    gzip (or the gzip compatible Zopfli) or Brotli. In the optimal case,
    the server sends the data compress with Zopfli over HTTP, and Brotli
    over HTTPS.

* Dealing with special cases.

  One such special case is `SVGZ` files that are `SVG` files
  compressed with gzip. Since they are already compressed, they
  shouldn't be compressed again. However, sending them without the
  `Content-Encoding: gzip` header will create problems as user agents
  will not know they need to decompress before trying to display them.

## What does the hint check?

The hint checks for the use cases previously specified. Namely, it
checks that:

* Only resources for which the result of the compression is smaller
  than original size are served compressed.

* The most efficient encodings are used (by default the hint check if
  Zopfli is used over HTTP and Brotli over `HTTPS`, however that can
  be changed, see: [`Can the hint be configured?`
  section](#can-the-hint-be-configured)).

* Deprecated or not widely supported encodings, and `Content-Type`
  values are not used.

* Potential caching related issues are avoided.

* Resources are served compressed only when requested as such, are
  appropriately encoded, and no user-agent detection is done.

* Special cases (such as `SVGZ`) are handled correctly.

### Examples that **trigger** the hint

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
original size: 13 bytes

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
Zopfli over HTTP.

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

Resource that should be compressed is served compressed using Brotli
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
Brotli over HTTPS.

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
(e.g.: is not served with the `Vary` header with the `Accept-Encoding`
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

Resource is blindly served compressed using gzip no matter what the
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

however, when requested with

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

### Examples that **pass** the hint

Resource that should be compressed is served compressed using Zopfli
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

Resource that should be compressed is served compressed using Brotli
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

## How to configure the server to pass this hint

<details><summary>How to configure Apache</summary>

Apache can be configured to conditionally (based on media type)
compress resources using gzip as well as send the appropriate
`Content-Encoding` and `Vary` headers using [`mod_deflate`][mod_deflate]
and the [`AddOutputFilterByType` directive][addoutputfilterbytype].

For Zopfli, there isn't a core Apache module or directive to do it,
However, since compressing things using Zopfli takes more time, it's
usually indicated to do it as part of your build step. Once that is
done, Apache needs to be configure to server those pre-compressed
files when gzip compression is requested by the user agent.

Starting with Apache `v2.4.26`, [`mod_brotli`][mod_brotli] and the
[`AddOutputFilterByType` directive][addoutputfilterbytype] can be used
to conditionally compress with Brotli as well as add the
`Content-Encoding` and `Vary` headers. However, like Zopfli, Brotli can
take more time. So, when provided, `mod_brotli` may be used to compress
dynamic resources (especially if set to use lower compression quality
levels), but for static resources it's indicated to compress them as
part of the build process and configure Apache to serve those
pre-compressed resources whenever Brotli compression is requested over
HTTPS.

If you don't want to start from scratch, below is a generic starter
snippet that contains the necessary configurations to ensure that
commonly used file types are served compressed and with the appropriate
headers, and thus, make your web site/app pass this hint.

Important notes:

* The following relies on Apache being configure to have the correct
  filename extensions to media types mappings (see Apache section from
  [`content-type` hint](content-type.md#how-to-configure-the-server-to-pass-this-hint)).

* For Zopfli and Brotli this snippet assumes that running the build
  step will result in 3 version for every resource:

  * the original (e.g.: script.js) - you should also have this file
    in case the user agent doesn't requests things compressed
  * the file compressed with Zopfli (e.g.: script.js.gz)
  * the file compressed with Brotli (e.g.: script.js.br)

```apache
<IfModule mod_headers.c>
    <IfModule mod_rewrite.c>

        # Turn on the rewrite engine (this is necessary in order for
        # the `RewriteRule` directives to work).
        #
        # https://httpd.apache.org/docs/current/mod/core.html#options

        RewriteEngine On

        # Enable the `FollowSymLinks` option if it isn't already.
        #
        # https://httpd.apache.org/docs/current/mod/core.html#options

        Options +FollowSymlinks

        # If the web host doesn't allow the `FollowSymlinks` option,
        # it needs to be comment out or removed, and then the following
        # uncomment, but be aware of the performance impact.
        #
        # https://httpd.apache.org/docs/current/misc/perf-tuning.html#symlinks

        # Options +SymLinksIfOwnerMatch

        # Depending on how the server is set up, you may also need to
        # use the `RewriteOptions` directive to enable some options for
        # the rewrite engine.
        #
        # https://httpd.apache.org/docs/current/mod/mod_rewrite.html#rewriteoptions

        # RewriteBase /

        # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        # 1) Brotli

            # If `Accept-Encoding` header contains `br`

            RewriteCond "%{HTTP:Accept-encoding}" "br"

            # and the request is made over HTTPS.

            RewriteCond "%{HTTPS}" "on"

            # The Brotli pre-compressed version of the file exists
            # (e.g.: `script.js` is requested and `script.js.gz` exists).

            RewriteCond "%{REQUEST_FILENAME}\.br" "-s"

            # Then, serve the Brotli pre-compressed version of the file.

            RewriteRule "^(.*)" "$1\.br" [QSA]

            # Set the correct media type of the requested file. Otherwise,
            # it will be served with the br media type since the file has
            # the `.br` extension.
            #
            # Also, set the special purpose environment variables so
            # that Apache doesn't recompress these files.

            RewriteRule "\.(ico|cur)\.br$"      "-" [T=image/x-icon,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.(md|markdown)\.br$"  "-" [T=text/markdown,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.appcache\.br$"       "-" [T=text/cache-manifest,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.atom\.br$"           "-" [T=application/atom+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.bmp\.br$"            "-" [T=image/bmp,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.css\.br$"            "-" [T=text/css,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.eot.\.br$"           "-" [T=application/vnd.ms-fontobject,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.geojson\.br$"        "-" [T=application/vnd.geo+json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.html?\.br$"          "-" [T=text/html,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.ics\.br$"            "-" [T=text/calendar,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.json\.br$"           "-" [T=application/json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.jsonld\.br$"         "-" [T=application/ld+json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.m?js\.br$"           "-" [T=text/javascript,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.otf\.br$"            "-" [T=font/otf,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.rdf\.br$"            "-" [T=application/rdf+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.rss\.br$"            "-" [T=application/rss+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.svg\.br$"            "-" [T=image/svg+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.ttc\.br$"            "-" [T=font/collection,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.ttf\.br$"            "-" [T=font/ttf,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.txt\.br$"            "-" [T=text/plain,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.vc(f|ard)\.br$"      "-" [T=text/vcard,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.vtt\.br$"            "-" [T=text/vtt,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.webmanifest\.br$"    "-" [T=application/manifest+json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.xhtml\.br$"          "-" [T=application/xhtml+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.xml\.br$"            "-" [T=text/xml,E=no-brotli:1,E=no-gzip:1]

            # Set the `Content-Encoding` header.

            <FilesMatch "\.br$">
                Header append Content-Encoding br
            </FilesMatch>

        # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        # 2) Zopfli

            # If `Accept-Encoding` header contains `gzip` and the
            # request is made over HTTP.

            RewriteCond "%{HTTP:Accept-encoding}" "gzip"

            # The Zopfli pre-compressed version of the file exists
            # (e.g.: `script.js` is requested and `script.js.gz` exists).

            RewriteCond "%{REQUEST_FILENAME}\.gz" "-s"

            # Then serve the Zopfli pre-compressed version of the file.

            RewriteRule "^(.*)" "$1\.gz" [QSA]

            # Set the media types of the file, as otherwise, because
            # the file has the `.gz` extension, it wil be served with
            # the gzip media type.
            #
            # Also, set the special purpose environment variables so
            # that Apache doesn't recompress these files.

            RewriteRule "\.(ico|cur)\.gz$"      "-" [T=image/x-icon,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.(md|markdown)\.gz$"  "-" [T=text/markdown,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.appcache\.gz$"       "-" [T=text/cache-manifest,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.atom\.gz$"           "-" [T=application/atom+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.bmp\.gz$"            "-" [T=image/bmp,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.css\.gz$"            "-" [T=text/css,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.eot.\.gz$"           "-" [T=application/vnd.ms-fontobject,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.geojson\.gz$"        "-" [T=application/vnd.geo+json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.html?\.gz$"          "-" [T=text/html,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.ics\.gz$"            "-" [T=text/calendar,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.json\.gz$"           "-" [T=application/json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.jsonld\.gz$"         "-" [T=application/ld+json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.m?js\.gz$"           "-" [T=text/javascript,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.otf\.gz$"            "-" [T=font/otf,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.rdf\.gz$"            "-" [T=application/rdf+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.rss\.gz$"            "-" [T=application/rss+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.svg\.gz$"            "-" [T=image/svg+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.ttc\.gz$"            "-" [T=font/collection,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.ttf\.gz$"            "-" [T=font/ttf,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.txt\.gz$"            "-" [T=text/plain,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.vc(f|ard)\.gz$"      "-" [T=text/vcard,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.vtt\.gz$"            "-" [T=text/vtt,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.webmanifest\.gz$"    "-" [T=application/manifest+json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.xhtml\.gz$"          "-" [T=application/xhtml+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.xml\.gz$"            "-" [T=text/xml,E=no-brotli:1,E=no-gzip:1]

            # Set the `Content-Encoding` header.

            <FilesMatch "\.gz$">
                Header append Content-Encoding gzip
            </FilesMatch>

        # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        # Set the `Vary` header.

        <FilesMatch "\.(br|gz)$">
            Header append Vary Accept-Encoding
        </FilesMatch>

    </IfModule>
</IfModule>

<IfModule mod_deflate.c>

    # 3) gzip
    #
    # [!] For Apache versions below version 2.3.7 you don't need to
    # enable `mod_filter` and can remove the `<IfModule mod_filter.c>`
    # and `</IfModule>` lines as `AddOutputFilterByType` is still in
    # the core directives.
    #
    # https://httpd.apache.org/docs/current/mod/mod_filter.html#addoutputfilterbytype

    <IfModule mod_filter.c>
        AddOutputFilterByType DEFLATE "application/atom+xml" \
                                      "application/json" \
                                      "application/manifest+json" \
                                      "application/rdf+xml" \
                                      "application/rss+xml" \
                                      "application/schema+json" \
                                      "application/vnd.ms-fontobject" \
                                      "application/xhtml+xml" \
                                      "font/collection" \
                                      "font/opentype" \
                                      "font/otf" \
                                      "font/ttf" \
                                      "image/bmp" \
                                      "image/svg+xml" \
                                      "image/x-icon" \
                                      "text/cache-manifest" \
                                      "text/css" \
                                      "text/html" \
                                      "text/javascript" \
                                      "text/plain" \
                                      "text/vtt" \
                                      "text/xml"
    </IfModule>

    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    # Special case: SVGZ
    #
    # If these files type would be served without the
    # `Content-Enable: gzip` response header, user agents would
    # not know that they first need to uncompress the response,
    # and thus, wouldn't be able to understand the content.

    <IfModule mod_mime.c>
        AddEncoding gzip              svgz
    </IfModule>

</IfModule>
```

Also note that:

* The above snippet works with Apache `v2.2.0+`, but you need to
  have [`mod_deflate`][mod_deflate], [`mod_mime`][mod_mime],
  [`mod_rewrite`][mod_rewrite], and for Apache versions below
  `v2.3.7` [`mod_filter`][mod_filter] [enabled][how to enable apache
  modules] in order for it to take effect.

* If you have access to the [main Apache configuration file][main
  apache conf file] (usually called `httpd.conf`), you should add
  the logic in, for example, a [`<Directory>`][apache directory]
  section in that file. This is usually the recommended way as
  [using `.htaccess` files slows down][htaccess is slow] Apache!

  If you don't have access to the main configuration file (quite
  common with hosting services), add the snippets in a `.htaccess`
  file in the root of the web site/app.

For the complete set of configurations, not just for this rule, see
the [Apache server configuration related documentation][apache config].

</details>
<details><summary>How to configure IIS</summary>

IIS 7+ can be configured to compress responses (static or dynamic)
via the [`<urlCompression> element`][urlcompression].

For Zopfli, there isn't a core IIS module to do it. However, since
compressing things using Zopfli takes more time, it's usually indicated
to do it as part of your build step. Once that is done, IIS needs to
be configured to server those pre-compressed files when gzip compression
is requested by the user agent.

Brotli, like Zopfli, takes more time. It's indicated to compress
resources at build time, and configure IIS to serve those pre-compressed
resources whenever Brotli compression is requested over HTTPS by the
user agent.

If you don't want to start from scratch, below is a generic starter
snippet that contains the necessary configurations to ensure that
commonly used file types are served compressed and with the appropriate
headers, and thus, make your web site/app pass this hint.

Important notes:

* The following relies on IIS being configured to have the correct
  filename extensions to media types mappings (see IIS section from
  [`content-type` rule](content-type.md#how-to-configure-the-server-to-pass-this-hint)).

* For Zopfli and Brotli this snippet assumes that running the build
  step will result in 3 version for every resource:

  * the original (e.g.: script.js) - you should also have this file
    in case the user agent doesn't requests things compressed
  * the file compressed with Zopfli (e.g.: script.js.gz)
  * the file compressed with Brotli (e.g.: script.js.br)

```xml
<configuration>
    <system.webServer>
        <staticContent>
            <!-- IIS doesn't know about Brotli. If mimeMap is not added
                 br files will not be served -->
            <mimeMap fileExtension=".br" mimeType="application/brotli" />
        <staticContent>

        <rewrite>
            <rewriteMaps>
                <!-- List of all the file types and the right `content-type` values
                     when compressed. They will be restored in an outboud rule. -->
                <rewriteMap name="CompressedExtensions" defaultValue="">
                    <!-- zopfli mapping -->
                    <add key="appcache.gz" value="text/cache-manifest; charset=utf-8" />
                    <add key="bmp.gz" value="image/bmp" />
                    <add key="css.gz" value="text/css; charset=utf-8" />
                    <add key="cur.gz" value="image/x-icon" />
                    <add key="eot.gz" value="application/vnd.ms-fontobject" />
                    <add key="html.gz" value="text/html; charset=utf-8" />
                    <add key="ico.gz" value="image/x-icon" />
                    <add key="js.gz" value="text/javascript; charset=utf-8" />
                    <add key="json.gz" value="application/json; charset=utf-8" />
                    <add key="map.gz" value="application/json; charset=utf-8" />
                    <add key="mjs.gz" value="text/javascript; charset=utf-8" />
                    <add key="otf.gz" value="font/otf" />
                    <add key="rss.gz" value="application/rss+xml; charset=utf-8" />
                    <add key="svg.gz" value="image/svg+xml; charset=utf-8" />
                    <add key="ttf.gz" value="font/ttf; charset=utf-8" />
                    <add key="txt.gz" value="text/plain; charset=utf-8" />
                    <add key="vtt.gz" value="text/vtt; charset=utf-8" />
                    <add key="webmanifest.gz" value="application/manifest+json; charset=utf-8" />
                    <add key="xml.gz" value="text/xml; charset=utf-8" />
                    <!-- brotli mapping -->
                    <add key="appcache.br" value="text/cache-manifest; charset=utf-8" />
                    <add key="bmp.br" value="image/bmp" />
                    <add key="css.br" value="text/css; charset=utf-8" />
                    <add key="cur.br" value="image/x-icon" />
                    <add key="eot.br" value="application/vnd.ms-fontobject" />
                    <add key="html.br" value="text/html; charset=utf-8" />
                    <add key="ico.br" value="image/x-icon" />
                    <add key="js.br" value="text/javascript; charset=utf-8" />
                    <add key="json.br" value="application/json; charset=utf-8" />
                    <add key="map.br" value="application/json; charset=utf-8" />
                    <add key="mjs.br" value="text/javascript; charset=utf-8" />
                    <add key="otf.br" value="font/otf" />
                    <add key="rss.br" value="application/rss+xml; charset=utf-8" />
                    <add key="svg.br" value="image/svg+xml; charset=utf-8" />
                    <add key="ttf.br" value="font/ttf; charset=utf-8" />
                    <add key="txt.br" value="text/plain; charset=utf-8" />
                    <add key="vtt.br" value="text/vtt; charset=utf-8" />
                    <add key="webmanifest.br" value="application/manifest+json; charset=utf-8" />
                    <add key="xml.br" value="text/xml; charset=utf-8" />
                </rewriteMap>
            </rewriteMaps>
            <outboundRules>
                <!-- Restore the mime type for compressed assets. See below for more explanation. -->
                <rule name="RestoreMime" enabled="true">
                    <match serverVariable="RESPONSE_Content_Type" pattern=".*" />
                    <conditions>
                        <add input="{HTTP_URL}" pattern="\.((?:appcache|bmp|css|cur|eot|html|ico|js|json|map|mjs|otf|rss|svg|ttf|txt|vtt|webmanifest|xml)\.(gz|br))" />
                        <add input="{CompressedExtensions:{C:1}}" pattern="(.+)" />
                    </conditions>
                    <action type="Rewrite" value="{C:3}" />
                </rule>
                <!-- add vary header -->
                <rule name="AddVaryAcceptEncoding" preCondition="PreCompressedFile" enabled="true">
                    <match serverVariable="RESPONSE_Vary" pattern=".*" />
                    <action type="Rewrite" value="Accept-Encoding" />
                </rule>
                <!-- indicate response is encoded with brotli -->
                <rule name="AddEncodingBrotli" preCondition="PreCompressedBrotli" enabled="true" stopProcessing="true">
                    <match serverVariable="RESPONSE_Content_Encoding" pattern=".*" />
                    <action type="Rewrite" value="br" />
                </rule>
                <!-- indicate response is encoded with gzip -->
                <rule name="AddEncodingZopfli" preCondition="PreCompressedZopfli" enabled="true" stopProcessing="true">
                    <match serverVariable="RESPONSE_Content_Encoding" pattern=".*" />
                    <action type="Rewrite" value="gzip" />
                </rule>

                <preConditions>
                    <preCondition name="PreCompressedFile">
                        <add input="{HTTP_URL}" pattern="\.((?:appcache|bmp|css|cur|eot|html|ico|js|json|map|mjs|otf|rss|svg|ttf|txt|vtt|webmanifest|xml)\.(gz|br))" />
                    </preCondition>
                    <preCondition name="PreCompressedZopfli">
                        <add input="{HTTP_URL}" pattern="\.((?:appcache|bmp|css|cur|eot|html|ico|js|json|map|mjs|otf|rss|svg|ttf|txt|vtt|webmanifest|xml)\.gz)" />
                    </preCondition>
                    <preCondition name="PreCompressedBrotli">
                        <add input="{HTTP_URL}" pattern="\.((?:appcache|bmp|css|cur|eot|html|ico|js|json|map|mjs|otf|rss|svg|ttf|txt|vtt|webmanifest|xml)\.br)" />
                    </preCondition>
                </preConditions>
            </outboundRules>
            <rules>
                <!--
                    Compression rules. This works in combination with the `outbound rules` bellow. Basically what happens is:

                    1. We check if the user agent supprots compression via the `Accept-Encoding` header.
                    2. We prioritize `brotli` of `gzip`, and append the right extension (`.gz` or `.br`) and prepend `dist`.
                       `dist` is where all the pulic assets live. This is transparent to the user.
                       We assume all assets with those extensions have a `.gz` and `.br` version because of the build system we
                       have.
                       IIS then serves the asset applying the outbound rules.
                    3. If the final part of the file (`.ext.gz` or `.ext.br`) matches one of the `CompressedExtensions` `rewriteMap`, we
                       rewrite the `content-type` header
                    4. Based on the extension (`.gz` or `.br`), we rewrite the `content-encoding` header
                -->
                <rule name="ServerPreCompressedBrotli" stopProcessing="true">
                    <match url="^(.*/)?(.*?)\.(appcache|bmp|css|cur|eot|html|ico|js|json|map|mjs|otf|rss|svg|ttf|txt|vtt|webmanifest|xml)([?#].*)?$" ignoreCase="true"/>
                    <conditions>
                        <add input="{HTTP_ACCEPT_ENCODING}" pattern="br"/>
                    </conditions>
                    <action type="Rewrite" url="dist{REQUEST_URI}.br"/>
                </rule>
                <rule name="ServerPreCompressedZopfli" stopProcessing="true">
                    <match url="^(.*/)?(.*?)\.(appcache|bmp|css|cur|eot|html|ico|js|json|map|mjs|otf|rss|svg|ttf|txt|vtt|webmanifest|xml)([?#].*)?$" ignoreCase="true"/>
                    <conditions>
                        <add input="{HTTP_ACCEPT_ENCODING}" pattern="gzip"/>
                    </conditions>
                    <action type="Rewrite" url="dist{REQUEST_URI}.gz"/>
                </rule>
                <!-- Fallback in case the user agent doesn't support compression -->
                <rule name="static">
                    <match url="(?!scanner|search).*$" ignoreCase="true"/>
                    <action type="Rewrite" url="dist{REQUEST_URI}"/>
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```

Note that:

* The above snippet works with IIS 7+.
* You should use the above snippet in the `web.config` of your
  application.

For the complete set of configurations, not just for this rule,
see the [IIS server configuration related documentation][iis config].

If you prefer to let IIS compress your assets using Brotli, you can
use the [`IIS compression scheme providers`][iis compression]. However,
make sure to read [how to enable multiple compression schemes][multiple
compression schemes] and the priority limitations in some versions.

</details>

## Can the hint be configured?

You can override the defaults by specifying what type of compression
you don't want the hint to check for. This can be done for the `html`
(main page) and/or the `resources` the hint determines should be served
compressed, using the following format:

In the [`.hintrc`][hintrc] file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "http-compression": [ "warning", {
            "resource": {
                "<compression_type>": <true|false>,
                "threshold": <number>
                ...
            },
            "html": {
                "<compression_type>": <true|false>,
                "threshold": <number>
                ...
            }
        },
        ...
    },
    ...
}
```

Where `<compression_method>` can be one of: `brotli`, `gzip`, or
`zopfli`.
And `threshold` is the maximum size (in bytes) to set the
severity of a report to `hint`.
E.g. If you want the hint to check if only the page resources are
served compressed using Brotli, and not the page itself, you can
use the following configuration in the [`.hintrc`][hintrc]:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "http-compression": [ "warning", {
            "html": {
                "brotli": false,
                "threshold": 1024
            }
        }],
        ...
    },
    ...
}
```

Note: You can also use the [`ignoredUrls`][ignoring domains]
property from the `.hintrc` file to exclude domains you don’t control
(e.g.: CDNs) from these checks.

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
        "http-compression": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

<!-- Link labels: -->

[brotli]: https://github.com/google/brotli
[brotli blog post]: https://opensource.googleblog.com/2015/09/introducing-brotli-new-compression.html
[brotli over https]: https://medium.com/@yoavweiss/well-the-technical-reason-for-brotli-being-https-only-is-that-otherwise-there-s-a-very-high-508f15f0ad95
[deflate issues]: https://stackoverflow.com/questions/9170338/why-are-major-web-sites-using-GZIP/9186091#9186091
[gzip is not enough]: https://www.youtube.com/watch?v=whGwm0Lky2s
[gzip ratio]: https://www.youtube.com/watch?v=Mjab_aZsdxw&t=24s
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[identity]: https://tools.ietf.org/html/rfc2616#page-24
[unship sdch]: https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/nQl0ORHy7sw
[wdmsc]: https://whatdoesmysitecost.com/
[zopfli]: https://github.com/google/zopfli
[zopfli blog post]: https://developers.googleblog.com/2013/02/compress-data-more-densely-with-zopfli.html

<!-- Apache links -->

[addoutputfilterbytype]: https://httpd.apache.org/docs/2.4/mod/mod_filter.html#addoutputfilterbytype
[apache config]: https://webhint.io/docs/user-guide/server-configurations/apache/
[apache directory]: https://httpd.apache.org/docs/current/mod/core.html#directory
[how to enable apache modules]: https://github.com/h5bp/server-configs-apache/tree/7eb30da6a06ec4fc24daf33c75b7bd86f9ad1f68#enable-apache-httpd-modules
[htaccess is slow]: https://httpd.apache.org/docs/current/howto/htaccess.html#when
[main apache conf file]: https://httpd.apache.org/docs/current/configuring.html#main
[mod_brotli]:  https://httpd.apache.org/docs/trunk/mod/mod_brotli.html
[mod_deflate]: https://httpd.apache.org/docs/current/mod/mod_deflate.html
[mod_filter]: https://httpd.apache.org/docs/current/mod/mod_filter.html
[mod_mime]: https://httpd.apache.org/docs/current/mod/mod_mime.html
[mod_rewrite]: https://httpd.apache.org/docs/current/mod/mod_rewrite.html

<!-- IIS links -->

[iis compression]: https://docs.microsoft.com/en-us/iis/extensions/iis-compression/iis-compression-overview
[iis config]: https://webhint.io/docs/user-guide/server-configurations/iis/
[multiple compression schemes]: https://docs.microsoft.com/en-us/iis/extensions/iis-compression/using-iis-compression#enabling-multiple-compression-schemes
[urlcompression]: https://docs.microsoft.com/en-us/iis/configuration/system.webserver/urlcompression
[ignoring domains]: https://webhint.io/docs/user-guide/configuring-webhint/ignoring-domains/
