# HTTP cache (`http-cache`)

`http-cache` verifies that the page and all its resources follow a
good, sustainable caching strategy.

## Why is this important?

The right caching strategy can help improve site performance through:

* Shorter load times
* Reduced bandwidth
* Reduced server costs
* Having predictable behavior across browsers

Currently about ~50% of resources on the web can't be cached due to
their configuration:

![Cacheable Resources][maxage0 image]

[Source: http archive][maxage0]

## What does the hint check?

This hint checks the configuration of the `cache-control` header to
validate that the page and resources have a good caching strategy:

* all requests have a `Cache-Control` header, otherwise the behavior
  can change from browser to browser
* main page should have a short cache (<= 3 minutes) or not cache at all
* static resources such as JavaScript, CSS, images, etc.:
  * have a long expiry value (>= 1 year)
  * use the `immutable` directive
  * follow filename/path-based revving, and not
    one based on query string parameters (see: [problems with
    proxies][revving files])

The built-in regular expressions for file revving are:

```regexp
/\/[^/]+[._-]v?\d+(\.\d+(\.\d+)?)?[^/]*\.\w+$/i
/\/v?\d+\.\d+\.\d+.*?\//i
/\/v\d.*?\//i
/\/([^/]+[._-])?([0-9a-f]{5,})([._-].*?)?\.\w+$/i
```

This will match URLs like the following:

```text
https://example.com/assets/jquery-2.1.1.js
https://example.com/assets/jquery-2.1.1.min.js
https://example.com/assets/jquery-3.0.0-beta.js
https://example.com/assets/favicon.123.ico
https://example.com/wp-content/uploads/fvm/out/header-cb050ccd-1524626949.min.js
https://example.com/jquery.lazy/1.6.5/jquery.lazy.min.js
https://example.com/site/javascript/v5/jquery.cookie.js
https://example.com/rsrc.php/v3iJhv4/yG/l/en_US/sqNNamBywvN.js
https://example.com/assets/unicorn-d41d8cd98f.css
https://example.com/assets/app.e1c7a.bundle.js
https://example.com/assets/9f61f58dd1cc3bb82182.bundle.js
https://example.com/assets/9f61f.js
https://example.com/assets/9f61f.min.js
```

[Test your URLs](https://regex101.com/r/KDPUtH/)

### Examples that **trigger** the hint

`Cache-Control` header is not sent:

```text
HTTP/... 200 OK

Content-Type: text/javascript; charset=utf-8
...
```

An invalid directive:

```text
HTTP/... 200 OK

Cache-Control: invalid directive
...
```

An invalid directive-value pair:

```text
HTTP/... 200 OK

Cache-Control: max-age=abc
...
```

Uses a directive that is not recommended:

```text
HTTP/... 200 OK

Cache-Control: max-age=3600, must-revalidate
...
```

The combination of directives doesn't make sense:

```text
HTTP/... 200 OK

Cache-Control: no-cache, max-age=3600
...
```

The page has a `max-age` value greater than 3 minutes

```text
HTTP/... 200 OK

Content-Type: text/html; charset=utf-8
Cache-Control: max-age=300
...
```

A static resource has a `max-age` value less than 1 year:

```text
HTTP/... 200 OK

Content-Type: text/javascript; charset=utf-8
Cache-Control: max-age=3600
...
```

A static resource doesn't have the `immutable` directive:

```text
HTTP/... 200 OK

Content-Type: text/javascript; charset=utf-8
Cache-Control: max-age=31536000
...
```

### Examples that **pass** the hint

A static resource with `max-age` greater than 1 year and the `immutable`
directive:

```text
HTTP/... 200 OK

Content-Type: text/javascript; charset=utf-8
Cache-Control: max-age=31536000, immutable
...
```

A page with `no-cache`:

```text
HTTP/... 200 OK

Content-Type: text/html; charset=utf-8
Cache-Control: no-cache
...
```

## How to configure the server to pass this hint

<details><summary>How to configure Apache</summary>

Enabling Apache to automatically add the `Cache-Control` header
(as well as the equivalent `Expires` header) can be done using the
[`ExpiresActive` directive][expiresactive].

`Cache-Control` header's `max-age` values can be set using the
[`ExpiresDefault`][expiresdefault] and [`ExpiresByType`][expiresbytype]
directives. Other values such as `immutable` can be set using the
[`Header`][header directive] directive.

If you don't want to start from scratch, below is a generic starter
snippet that contains the necessary configurations to ensure that
commonly used file types are served with the appropriate `Cache-Control`
header, and thus, make your web site/app pass this hint.

Important notes:

* Do not use the following snippet if you are not doing filename revving.
* The following relies on Apache being configured to have the correct
  filename extensions to media types mappings (see Apache section from
  [`content-type` hint](content-type.md#how-to-configure-the-server-to-pass-this-hint)).

```apache
<IfModule mod_expires.c>

  # Automatically add the `Cache-Control` header (as well as the
  # equivalent `Expires` header).

    ExpiresActive on

  # By default, inform user agents to cache all resources for 1 year.

    ExpiresDefault                                   "access plus 1 year"


  # Overwrite the previous for file types whose content usually changes
  # very often, and thus, should not be cached for such a long period,
  # or at all.

    # AppCache manifest files

        ExpiresByType text/cache-manifest            "access plus 0 seconds"


    # /favicon.ico (cannot be renamed!)

        # [!] If you have access to the main Apache configuration
        #     file, you can match the root favicon exactly using the
        #     `<Location>` directive. The same cannot be done inside
        #     of a `.htaccess` file where only the `<Files>` directive
        #     can be used, reason why the best that can be done is match
        #     all files named `favicon.ico` (but that should work fine
        #     if filename/path-based revving is used)
        #
        # See also: https://httpd.apache.org/docs/current/sections.html#file-and-web.

        <Files "favicon.ico">
            ExpiresByType image/x-icon               "access plus 1 hour"
        </Files>


    # Data interchange

        ExpiresByType application/atom+xml           "access plus 1 hour"
        ExpiresByType application/rdf+xml            "access plus 1 hour"
        ExpiresByType application/rss+xml            "access plus 1 hour"

        ExpiresByType application/json               "access plus 0 seconds"
        ExpiresByType application/ld+json            "access plus 0 seconds"
        ExpiresByType application/schema+json        "access plus 0 seconds"
        ExpiresByType application/vnd.geo+json       "access plus 0 seconds"
        ExpiresByType text/xml                       "access plus 0 seconds"


    # HTML

        ExpiresByType text/html                      "access plus 0 seconds"


    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    # Where needed add `immutable` value to the `Cache-Control` header

    <IfModule mod_headers.c>

        # Because `mod_headers` cannot match based on the content-type,
        # the following workaround needs to be done.

        # 1) Add the `immutable` value to the `Cache-Control` header
        #    to all resources.

        Header merge Cache-Control immutable

        # 2) Remove the value for all resources that shouldn't be have it.

        <FilesMatch "\.(appcache|cur|geojson|ico|json(ld)?|x?html?|topojson|xml)$">
            Header edit Cache-Control immutable ""
        </FilesMatch>

    </IfModule>

</IfModule>
```

Also note that:

* The above snippet works with Apache `v2.2.0+`, but you need to
  have [`mod_expires`][mod_expires] and [`mod_headers`][mod_headers]
  [enabled][how to enable apache modules]
  for it to take effect.

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

You can enable the `Cache-Control` and/or `Expire` headers on IIS
using the [`<clientCache> element under <staticContent>`][clientcache
iis].

`<clientCache>` will set the cache for all the configured static
content so you might want to use it in combination with the
`<location>` element and set different values depending on where
the resources are in the file system.

The following is an example that sets `cache-control: no-cache`
for all static resources and then overrides it for the files under
the `static` folder with `cache-control: max-age=31536000, immutable`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <system.webServer>
        <staticContent>
            <clientCache cacheControlMode="DisableCache" />
        </staticContent>
    </system.webServer>
    <location path="static">
        <system.webServer>
            <staticContent>
                <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" cacheControlCustom="immutable" />
            </staticContent>
        </system.webServer>
    </location>
</configuration>
```

In the example above, you want to have your JavaScript, CSS, images,
etc. under the `static` folder, and your HTML elsewhere. If your static
content is in another folder change the path of `<location path="static">`
to the right one.

Important notes:

* Do not use the above snippet if you are not doing filename revving.
* The above snippet works with IIS 7+.
* You should use the above snippet in the `web.config` of your
  application.

For the complete set of configurations, not just for this rule,
see the [IIS server configuration related documentation][iis config].

</details>

## Can the hint be configured?

Yes, you can configure:

* the `max-age` values for the page and resources
* the regular expressions used to know if the file is immutable or not

### `max-age`

By default, the recommended value for the page is
`Cache-Control: no-cache` or a `max-age` equal or less to 3 minutes.
For the resources `max-age` should be greater or equal to 1 year.
You can change this as follows:

```json
"http-cache": ["error", {
    "maxAgeTarget": 300, // 5 minutes in seconds
    "maxAgeResource": 1576800 // 6 months in seconds
}]
```

### Custom regular expressions for revving files

If none of the built-in regular expressions work for your use case,
you can provide your own via the `revvingPatterns` property. This
property accepts an `Array` of escaped `RegExp`:

in the [`.hintrc`][hintrc] file:

```json

{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "http-cache": ["error", {
            "revvingPatterns": ["\\/\\d+\\/\\w+\\.\\w{1,3}"]
        }],
        ...
    },
    ...
}
```

Also pay attention to the escaping. The example above will validate
that static resources follow a convention like the following
one:

```text
https://example.com/assets/12345/script.js
https://example.com/assets/12345/styles.css
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
        "http-cache": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [caching best practices][caching best practices]
* [Cache-Control: immutable][cache-control immutable]
* [HTTP Caching - Google Web Fundamentals][google http caching]
* [How Well Do You Know the Web? (Google I/O'17, video)][how well you know the web]

<!-- Link labels: -->

[cache-control immutable]: https://bitsup.blogspot.ro/2016/05/cache-control-immutable.html
[caching best practices]: https://jakearchibald.com/2016/caching-best-practices/
[google http caching]: https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[how well you know the web]: https://youtu.be/vAgKZoGIvqs?t=12m20s
[maxage0]: https://desktop.httparchive.org/trends.php#maxage0
[maxage0 image]: https://chart.googleapis.com/chart?chd=t:-1|52,52,52,52,52,52,52,51,50,53,53,53,53,0,53,53,53&chxl=0:|8%2F18%7C8%2F18%7C9%2F18%7C9%2F18%7C10%2F18%7C10%2F18%7C11%2F18%7C11%2F18%7C12%2F18%7C12%2F18%7C1%2F19%7C2%2F19%7C3%2F19%7C4%2F19%7C5%2F19%7C6%2F19%7C7%2F19&chxt=x&chs=600x300&cht=lxy&chco=184852&chxs=0,676767,11.5,0,lt,676767&chxtc=0,8&chm=N**+%,184852,0,::1,12,,h::8&chds=0,100,0,100&chts=184852,24&chtt=Cacheable+Resources&chls=2&chma=5,5,5,25
[revving files]: https://www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring/

<!-- Apache links -->

[apache config]: https://webhint.io/docs/user-guide/server-configurations/apache/
[apache directory]: https://httpd.apache.org/docs/current/mod/core.html#directory
[expiresactive]: https://httpd.apache.org/docs/current/mod/mod_expires.html#expiresactive
[expiresbytype]: https://httpd.apache.org/docs/current/mod/mod_expires.html#expiresbytype
[expiresdefault]: https://httpd.apache.org/docs/current/mod/mod_expires.html#expiresdefault
[header directive]: https://httpd.apache.org/docs/current/mod/mod_headers.html#header
[how to enable apache modules]: https://github.com/h5bp/server-configs-apache/wiki/How-to-enable-Apache-modules
[htaccess is slow]: https://httpd.apache.org/docs/current/howto/htaccess.html#when
[main apache conf file]: https://httpd.apache.org/docs/current/configuring.html#main
[mod_expires]: https://httpd.apache.org/docs/current/mod/mod_expires.html
[mod_headers]: https://httpd.apache.org/docs/current/mod/mod_headers.html

<!-- IIS links -->

[clientcache iis]: https://docs.microsoft.com/en-us/iis/configuration/system.webserver/staticcontent/clientcache
[iis config]: https://webhint.io/docs/user-guide/server-configurations/iis/
