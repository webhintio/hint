# Disallow unneeded HTTP headers for non-HTML resources (`no-html-only-headers`)

`no-html-only-headers` warns against responding with HTTP headers that
are not needed for non-HTML resources.

## Why is this important?

Some HTTP headers do not make sense to be send for non-HTML
resources, as sending them does not provide any value to users,
and just contributes to header bloat.

## What does the rule check?

The rule checks if non-HTML responses include any of the following
HTTP headers:

* `Content-Security-Policy`
* `X-Content-Security-Policy`
* `X-Frame-Options`
* `X-UA-Compatible`
* `X-WebKit-CSP`
* `X-XSS-Protection`

### Examples that **trigger** the rule

Response for `/test.js`:

```text
HTTP/... 200 OK

Content-Type: text/javascript; charset=utf-8
...
Content-Security-Policy: default-src 'none'
X-Content-Security-Policy: default-src 'none'
X-Frame-Options: DENY
X-UA-Compatible: IE=Edge,
X-WebKit-CSP: default-src 'none'
X-XSS-Protection: 1; mode=block
...
```

Response for `/test.html`:

```text
HTTP/... 200 OK

Content-Type: x/y
...
Content-Security-Policy: default-src 'none'
X-Content-Security-Policy: default-src 'none'
X-Frame-Options: DENY
X-UA-Compatible: IE=Edge,
X-WebKit-CSP: default-src 'none'
X-XSS-Protection: 1; mode=block
...
```

### Examples that **pass** the rule

Response for `/test.js`:

```text
HTTP/... 200 OK

Content-Type: text/javascript; charset=utf-8
...
```

Response for `/test.html`:

```text
HTTP/... 200 OK

Content-Type: text/html
...
Content-Security-Policy: default-src 'none'
X-Content-Security-Policy: default-src 'none'
X-Frame-Options: DENY
X-UA-Compatible: IE=Edge,
X-WebKit-CSP: default-src 'none'
X-XSS-Protection: 1; mode=block
...
```

## How to configure the server to pass this rule

<!-- markdownlint-disable MD033 -->

<details>
<summary>How to configure Apache</summary>

Apache can be configured to remove headers using the [`Header`
directive][header directive].

To remove the headers that are not needed for non-HTML resources,
you can do something such as the following:

```apache
<IfModule mod_headers.c>

    # Because `mod_headers` cannot match based on the content-type,
    # the following workaround needs to be used.

    <FilesMatch "\.(appcache|atom|bbaw|bmp|crx|css|cur|eot|f4[abpv]|flv|geojson|gif|htc|ic[os]|jpe?g|m?js|json(ld)?|m4[av]|manifest|map|markdown|md|mp4|oex|og[agv]|opus|otf|pdf|png|rdf|rss|safariextz|svgz?|swf|topojson|tt[cf]|txt|vcard|vcf|vtt|webapp|web[mp]|webmanifest|woff2?|xloc|xml|xpi)$">
        Header unset Content-Security-Policy
        Header unset X-Content-Security-Policy
        Header unset X-Frame-Options
        Header unset X-UA-Compatible
        Header unset X-WebKit-CSP
        Header unset X-XSS-Protection
    </FilesMatch>
</IfModule>
```

Note that:

* The above snippet works with Apache `v2.2.0+`, but you need to have
  [`mod_headers`][mod_headers] [enabled][how to enable apache modules]
  in order for it to take effect.

* If you have access to the [main Apache configuration file][main
  apache conf file] (usually called `httpd.conf`), you should add
  the logic in, for example, a [`<Directory>`][apache directory]
  section in that file. This is usually the recommended way as
  [using `.htaccess` files slows down][htaccess is slow] Apache!

  If you don't have access to the main configuration file (quite
  common with hosting services), just add the snippets in a `.htaccess`
  file in the root of the web site/app.

</details>

<!-- markdownlint-enable MD033 -->

## Can the rule be configured?

Yes, you can use:

* `include` to specify additional HTTP headers that should
  be disallowed for non-HTML resources
* `ignore` to specify which of the disallowed HTTP headers
  should be ignored

E.g. The following configuration will make the rule allow non-HTML
resources to be served with the `Content-Security-Policy` HTTP header,
but not with `Custom-Header`.

```json
"no-html-only-headers": [ "warning", {
    "ignore": ["Content-Security-Policy"],
    "include": ["Custom-Header"]
}]
```

<!-- Apache links -->

[apache directory]: https://httpd.apache.org/docs/current/mod/core.html#directory
[how to enable apache modules]: https://github.com/h5bp/server-configs-apache/wiki/How-to-enable-Apache-modules
[htaccess is slow]: https://httpd.apache.org/docs/current/howto/htaccess.html#when
[main apache conf file]: https://httpd.apache.org/docs/current/configuring.html#main
[mod_headers]: https://httpd.apache.org/docs/current/mod/mod_headers.html
