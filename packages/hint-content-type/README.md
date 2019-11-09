# Correct `Content-Type` header (`content-type`)

`content-type` warns against not serving resources with the
`Content-Type` HTTP response header with a value containing
the appropriate media type and charset for the response.

## Why is this important?

Even though browsers sometimes [ignore][server configs] the value of
the `Content-Type` header and try to [sniff the content][mime sniffing
spec] (see also: [`X-Content-Type-Options` hint][x content type options]),
it’s indicated to always send the appropriate media type and
charset for the response as, among other:

* the media type defines both the data format and how that data is intended
  to be processed by browsers

* not sending the appropriate `charset`, where appropriate, may
  [prevent things from being rendered correctly][incorrect rendering]
  thus creating a bad user experience (see also:
  [`meta-charset-utf-8` hint][meta charset hint])

* javascript resources served with the wrong media type [may be blocked][blocked
  resources]

## What does the hint check?

The hint checks if responses include the `Content-Type` HTTP response
header and its value contains the appropriate media type and charset
for the response.

### A note about `application/javascript`

This hint recommends using a `Content-Type` of `text/javascript` for
JavaScript resources as [noted in the HTML standard][html js mime].
However this hint also allows `application/javascript` because that
value was previously recommended by the IETF in [RFC 4329][rfc 4329].
RFC 4329 has [an active draft proposed][ietf js mime draft] to also
recommend `text/javascript` in the future.

See the section
[Can the hint be configured](#can-the-hint-be-configured) below for an
example of how to require a specific `Content-Type` value for
JavaScript resources if desired.

### Examples that **trigger** the hint

`Content-Type` response header is not sent:

```text
HTTP/... 200 OK

...
```

`Content-Type` response header is sent with an invalid value:

```text
HTTP/... 200 OK

...
Content-Type: invalid
```

```text
HTTP/... 200 OK

...
Content-Type: text/html;;;
```

`Content-Type` response header is sent with the wrong media type:

For `/example.png`

```text
HTTP/... 200 OK

...
Content-Type: font/woff2
```

`Content-Type` response header is sent with an unofficial media type:

For `/example.js`

```text
HTTP/... 200 OK

...
Content-Type: application/x-javascript; charset=utf-8
```

`Content-Type` response header is sent without the `charset` parameter
for response that should have it:

For `/example.html`

```text
HTTP/... 200 OK

...
Content-Type: text/html
```

### Examples that **pass** the hint

For `/example.png`

```text
HTTP/... 200 OK

...
Content-Type: image/png
```

For `/example.js`

```text
HTTP/... 200 OK

...
Content-Type: text/javascript; charset=utf-8
```

## How to configure the server to pass this hint

<!-- markdownlint-disable MD033 -->
<details><summary>How to configure Apache</summary>

By default Apache [maps certain filename extensions to specific media
types][mime.types file], but depending on the Apache version that is
used, some mappings may be outdated or missing.

Fortunately, Apache provides a way to overwrite and add to the existing
media types mappings using the [`AddType` directive][addtype]. For
example, to configure Apache to serve `.webmanifest` files with the
`application/manifest+json` media type, the following can be used:

```apache
<IfModule mod_mime.c>
    AddType application/manifest+json   webmanifest
</IfModule>
```

The same goes for mapping certain filename extensions to specific
charsets, which can be done using the [`AddDefaultCharset`][adddefaultcharset]
and [`AddCharset`][addcharset] directives.

If you don't want to start from scratch, below is a generic starter
snippet that contains the necessary mappings to ensure that commonly
used file types are served with the appropriate `Content-Type` response
header, and thus, make your web site/app pass this hint.

```apache
# Serve resources with the proper media types (f.k.a. MIME types).
# https://www.iana.org/assignments/media-types/media-types.xhtml

<IfModule mod_mime.c>

  # Data interchange

    # 2.2.x+

    AddType text/xml                                    xml

    # 2.2.x - 2.4.x

    AddType application/json                            json
    AddType application/rss+xml                         rss

    # 2.4.x+

    AddType application/json                            map

  # JavaScript

    # 2.2.x+

    # See: https://html.spec.whatwg.org/multipage/scripting.html#scriptingLanguages.
    AddType text/javascript                             js mjs


  # Manifest files

    # 2.2.x+

    AddType application/manifest+json                   webmanifest
    AddType text/cache-manifest                         appcache


  # Media files

    # 2.2.x - 2.4.x

    AddType audio/mp4                                   f4a f4b m4a
    AddType audio/ogg                                   oga ogg spx
    AddType video/mp4                                   mp4 mp4v mpg4
    AddType video/ogg                                   ogv
    AddType video/webm                                  webm
    AddType video/x-flv                                 flv

    # 2.2.x+

    AddType image/svg+xml                               svgz
    AddType image/x-icon                                cur

    # 2.4.x+

    AddType image/webp                                  webp


  # Web fonts

    # 2.2.x - 2.4.x

    AddType application/vnd.ms-fontobject               eot

    # 2.2.x+

    AddType font/woff                                   woff
    AddType font/woff2                                  woff2
    AddType font/ttf                                    ttf
    AddType font/collection                             ttc
    AddType font/otf                                    otf


  # Other

    # 2.2.x+

    AddType text/vtt                                    vtt

</IfModule>

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# Serve all resources labeled as `text/html` or `text/plain`
# with the media type `charset` parameter set to `utf-8`.
#
# https://httpd.apache.org/docs/current/mod/core.html#adddefaultcharset

AddDefaultCharset utf-8

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# Serve the following file types with the media type `charset`
# parameter set to `utf-8`.
#
# https://httpd.apache.org/docs/current/mod/mod_mime.html#addcharset

<IfModule mod_mime.c>
    AddCharset utf-8 .appcache \
                     .atom \
                     .css \
                     .js \
                     .json \
                     .manifest \
                     .map \
                     .mjs \
                     .rdf \
                     .rss \
                     .vtt \
                     .webmanifest \
                     .xml
</IfModule>
```

Note that:

* The above snippet works with Apache `v2.2.0+`, but you need to have
  [`mod_mime`][mod_mime] [enabled][how to enable apache modules]
  in order for it to take effect.

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

By default IIS [maps certain filename extensions to specific media
types][mime.types iis], but depending on the IIS version that is
used, some mappings may be outdated or missing.

Fortunately, IIS provides a way to overwrite and add to the existing
media types mappings using the [`<mimeMap>` element under <staticContent>][mimeMap].
For example, to configure IIS to serve `.webmanifest` files with the
`application/manifest+json` media type, the following can be used:

```xml
<staticContent>
    <mimeMap fileExtension="webmanifest" mimeType="application/manifest+json"/>
</staticContent>
```

The same `element` can be used to specify the charset. Continuing with
the example above, if we want to use `utf-8` it should be as follows:

```xml
<staticContent>
    <mimeMap fileExtension="webmanifest" mimeType="application/manifest+json; charset=utf-8"/>
</staticContent>
```

If you don't want to start from scratch, below is a generic starter
snippet that contains the necessary mappings to ensure that commonly
used file types are served with the appropriate `Content-Type` response
header, and thus, make your web site/app pass this hint.

**Note:** the `remove` element is used to make sure we don't use IIS defaults
for the given extension.

```xml
<configuration>
    <system.webServer>
        <staticContent>
            <!-- IIS doesn't set the charset automatically, so we have to override some
                 of the predefined ones -->

            <!-- Data interchange -->
            <mimeMap fileExtension=".json" mimeType="application/json; charset=utf-8"/>
            <mimeMap fileExtension=".map" mimeType="application/json; charset=utf-8"/>
            <mimeMap fileExtension=".rss" mimeType="application/rss+xml; charset=utf-8"/>
            <mimeMap fileExtension=".xml" mimeType="text/xml; charset=utf-8"/>

            <!-- JavaScript -->
            <!-- https://html.spec.whatwg.org/multipage/scripting.html#scriptingLanguages -->
            <mimeMap fileExtension=".js" mimeType="text/javascript; charset=utf-8"/>
            <mimeMap fileExtension=".mjs" mimeType="text/javascript; charset=utf-8"/>

            <!-- Manifest files -->
            <mimeMap fileExtension=".appcache" mimeType="text/cache-manifest; charset=utf-8"/>
            <mimeMap fileExtension=".webmanifest" mimeType="application/manifest+json; charset=utf-8"/>

            <!-- Media files -->
            <mimeMap fileExtension=".f4a" mimeType="audio/mp4"/>
            <mimeMap fileExtension=".f4b" mimeType="audio/mp4"/>
            <mimeMap fileExtension=".m4a" mimeType="audio/mp4"/>
            <mimeMap fileExtension=".oga" mimeType="audio/ogg"/>
            <mimeMap fileExtension=".ogg" mimeType="audio/ogg"/>
            <mimeMap fileExtension=".spx" mimeType="audio/ogg"/>

            <mimeMap fileExtension=".mp4" mimeType="video/mp4"/>
            <mimeMap fileExtension=".mp4v" mimeType="video/mp4"/>
            <mimeMap fileExtension=".mpg4" mimeType="video/mp4"/>
            <mimeMap fileExtension=".ogv" mimeType="video/ogg"/>
            <mimeMap fileExtension=".webm" mimeType="video/webm"/>
            <mimeMap fileExtension=".flv" mimeType="video/x-flv"/>

            <mimeMap fileExtension=".cur" mimeType="image/x-icon"/>
            <mimeMap fileExtension=".ico" mimeType="image/x-icon"/>
            <mimeMap fileExtension=".svg" mimeType="image/svg+xml; charset=utf-8"/>
            <mimeMap fileExtension=".svgz" mimeType="image/svg+xml"/>
            <mimeMap fileExtension=".webp" mimeType="image/webp"/>


            <!-- Font files -->
            <mimeMap fileExtension=".eot" mimeType="application/vnd.ms-fontobject"/>
            <mimeMap fileExtension=".otf" mimeType="font/otf"/>
            <mimeMap fileExtension=".ttc" mimeType="font/collection"/>
            <mimeMap fileExtension=".ttf" mimeType="font/ttf"/>
            <mimeMap fileExtension=".woff" mimeType="font/woff"/>
            <mimeMap fileExtension=".woff2" mimeType="font/woff2"/>

            <!-- Others -->
            <mimeMap fileExtension=".css" mimeType="text/css; charset=utf-8"/>
            <mimeMap fileExtension=".html" mimeType="text/html; charset=utf-8" />
            <mimeMap fileExtension=".txt" mimeType="text/plain; charset=utf-8" />
            <mimeMap fileExtension=".vtt" mimeType="text/vtt; charset=utf-8"/>
        </staticContent>

        <!-- This is needed only if you are serving .svgz images -->
        <outboundRules>
            <rule name="svgz-content-enconding" enabled="true">
                <match serverVariable="RESPONSE_Content_Encoding" pattern=".*" />
                <conditions>
                    <add input="{REQUEST_Filename}" pattern="\.svgz$" />
                </conditions>
                <action type="Rewrite" value="gzip" />
            </rule>
        </outboundRules>
    </system.webServer>
</configuration>
```

Note that:

* The above snippet works with IIS 7+.
* You should use the above snippet in the `web.config` of your
  application.

For the complete set of configurations, not just for this rule,
see the [IIS server configuration related documentation][iis config].

</details>

<!-- markdownlint-enable MD033 -->

## Can the hint be configured?

You can overwrite the defaults by specifying custom values for the
`Content-Type` header and the regular expressions that match the URLs
for which those values should be required.

`<regex>: <content_type_value>`

E.g. The following hint configuration will make `webhint` require
that all resources requested from a URL that matches the regular
expression `.*\.js` be served with a `Content-Type` header with the
value of `application/javascript; charset=utf-8`.

In the [`.hintrc`][hintrc] file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "content-type": ["error", {
            ".*\\.js": "application/javascript; charset=utf-8"
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
        "content-type": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [Setting the HTTP charset parameter](https://www.w3.org/International/articles/http-charset/index)

<!-- Link labels: -->

[blocked resources]: https://www.fxsitecompat.com/en-CA/docs/2016/javascript-served-with-wrong-mime-type-will-be-blocked/
[html js mime]: https://html.spec.whatwg.org/multipage/infrastructure.html#dependencies:mime-type
[ietf js mime draft]: https://tools.ietf.org/html/draft-ietf-dispatch-javascript-mjs
[incorrect rendering]: https://www.w3.org/International/questions/qa-what-is-encoding
[mime sniffing spec]: https://mimesniff.spec.whatwg.org/
[rfc 4329]: https://tools.ietf.org/html/rfc4329
[server configs]: https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Configuring_server_MIME_types
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/

<!-- Apache links -->

[addcharset]: https://httpd.apache.org/docs/current/mod/mod_mime.html#addcharset
[adddefaultcharset]: https://httpd.apache.org/docs/current/mod/core.html#adddefaultcharset
[addtype]: https://httpd.apache.org/docs/current/mod/mod_mime.html#addtype
[apache config]: https://webhint.io/docs/user-guide/server-configurations/apache/
[apache directory]: https://httpd.apache.org/docs/current/mod/core.html#directory
[how to enable apache modules]: https://github.com/h5bp/server-configs-apache/tree/7eb30da6a06ec4fc24daf33c75b7bd86f9ad1f68#enable-apache-httpd-modules
[htaccess is slow]: https://httpd.apache.org/docs/current/howto/htaccess.html#when
[main apache conf file]: https://httpd.apache.org/docs/current/configuring.html#main
[mime.types file]: https://github.com/apache/httpd/blob/trunk/docs/conf/mime.types
[mod_mime]: https://httpd.apache.org/docs/current/mod/mod_mime.html

<!-- IIS links -->

[iis config]: https://webhint.io/docs/user-guide/server-configurations/iis/
[mime.types iis]: https://support.microsoft.com/en-us/help/936496/description-of-the-default-settings-for-the-mimemap-property-and-for-t
[mimeMap]: https://docs.microsoft.com/en-us/iis/configuration/system.webserver/staticcontent/mimemap
[x content type options]: https://webhint.io/docs/user-guide/hints/hint-x-content-type-options/
[meta charset hint]: https://webhint.io/docs/user-guide/hints/hint-meta-charset-utf-8/
[ignoring domains]: https://webhint.io/docs/user-guide/configuring-webhint/ignoring-domains/
