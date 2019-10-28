# Unneeded HTTP headers (`no-html-only-headers`)

`no-html-only-headers` warns against responding with HTTP headers that
are not needed for non-HTML (or non-XML) resources.

## Why is this important?

Some HTTP headers do not make sense to be sent for non-HTML
resources, as sending them does not provide any value to users
and contributes to header bloat.

## What does the hint check?

The hint checks if non-HTML responses include any of the following
HTTP headers:

* `Content-Security-Policy`
* `X-Content-Security-Policy`
* `X-UA-Compatible`
* `X-WebKit-CSP`
* `X-XSS-Protection`

In case of a JavaScript file, `Content-Security-Policy` and
`X-Content-Security-Policy` will be ignored since CSP is
also relevant to workers.

### Examples that **trigger** the hint

Response for `/test.js`:

```text
HTTP/... 200 OK

Content-Type: text/javascript; charset=utf-8
...
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
X-UA-Compatible: IE=Edge,
X-WebKit-CSP: default-src 'none'
X-XSS-Protection: 1; mode=block
...
```

### Examples that **pass** the hint

Response for `/test.js`:

```text
HTTP/... 200 OK

Content-Type: text/javascript; charset=utf-8
Content-Security-Policy: default-src 'none'
X-Content-Security-Policy: default-src 'none'
...
```

Response for `/test.html`:

```text
HTTP/... 200 OK

Content-Type: text/html
...
Content-Security-Policy: default-src 'none'
X-Content-Security-Policy: default-src 'none'
X-UA-Compatible: IE=Edge,
X-WebKit-CSP: default-src 'none'
X-XSS-Protection: 1; mode=block
...
```

Response for `/test.xml`:

```text
HTTP/... 200 OK

Content-Type: application/xhtml+xml
...
Content-Security-Policy: default-src 'none'
X-Content-Security-Policy: default-src 'none'
X-UA-Compatible: IE=Edge,
X-WebKit-CSP: default-src 'none'
X-XSS-Protection: 1; mode=block
...
```

## How to configure the server to pass this hint

<details><summary>How to configure Apache</summary>

Apache can be configured to remove headers using the [`Header`
directive][header directive].

To remove the headers that are not needed for non-HTML resources,
you can do something such as the following:

```apache
<IfModule mod_headers.c>

    # Because `mod_headers` cannot match based on the content-type,
    # the following workaround needs to be used.

    <FilesMatch "\.(appcache|atom|bbaw|bmp|crx|css|cur|eot|f4[abpv]|flv|geojson|gif|htc|ic[os]|jpe?g|m?js|json(ld)?|m4[av]|manifest|map|markdown|md|mp4|oex|og[agv]|opus|otf|pdf|png|rdf|rss|safariextz|svgz?|swf|topojson|tt[cf]|txt|vcard|vcf|vtt|webapp|web[mp]|webmanifest|woff2?|xloc|xpi)$">
        Header unset X-UA-Compatible
        Header unset X-XSS-Protection
    </FilesMatch>

    <FilesMatch "\.(appcache|atom|bbaw|bmp|crx|css|cur|eot|f4[abpv]|flv|geojson|gif|htc|ic[os]|jpe?g|json(ld)?|m4[av]|manifest|map|markdown|md|mp4|oex|og[agv]|opus|otf|png|rdf|rss|safariextz|swf|topojson|tt[cf]|txt|vcard|vcf|vtt|webapp|web[mp]|webmanifest|woff2?|xloc|xpi)$">
        Header unset Content-Security-Policy
        Header unset X-Content-Security-Policy
        Header unset X-WebKit-CSP
    </FilesMatch>
</IfModule>
```

Note that:

* The above snippet works with Apache `v2.2.0+`, but you need to have
  [`mod_headers`][mod_headers] [enabled][how to enable apache modules]
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

If your application is adding the headers unconditionally to all
responses and you cannot modify it, the solution is to create
[`URL rewrite` rules][url rewrite] that will remove them from
any resource whose `Content-Type` header isn't `text/html`:

```xml
<configuration>
     <system.webServer>
        <rewrite>
            <outboundRules>
                 <rule name="Content-Security-Policy">
                    <match serverVariable="RESPONSE_Content_Security_Policy" pattern=".*" />
                    <conditions>
                        <add input="{RESPONSE_CONTENT_TYPE}" pattern="^(text/html|text/xml|application/xhtml+xml|text/javascript|application/pdf|image/svg+xml)" negate="true" />
                    </conditions>
                    <action type="Rewrite" value=""/>
                </rule>
                <rule name="X-Content-Security-Policy">
                    <match serverVariable="RESPONSE_X_Content_Security_Policy" pattern=".*" />
                    <conditions>
                        <add input="{RESPONSE_CONTENT_TYPE}" pattern="^(text/html|text/xml|application/xhtml+xml|text/javascript|application/pdf|image/svg+xml)" negate="true" />
                    </conditions>
                    <action type="Rewrite" value=""/>
                </rule>
                <rule name="X-UA-Compatible">
                    <match serverVariable="RESPONSE_X_UA_Compatible" pattern=".*" />
                    <conditions>
                        <add input="{RESPONSE_CONTENT_TYPE}" pattern="^text/html" negate="true" />
                    </conditions>
                    <action type="Rewrite" value=""/>
                </rule>
                <rule name="X-WebKit-CSP">
                    <match serverVariable="RESPONSE_X_Webkit_csp" pattern=".*" />
                    <conditions>
                        <add input="{RESPONSE_CONTENT_TYPE}" pattern="^(text/html|text/xml|application/xhtml+xml|text/javascript|application/pdf|image/svg+xml)" negate="true" />
                    </conditions>
                    <action type="Rewrite" value=""/>
                </rule>
                <rule name="X-XSS-Protection">
                    <match serverVariable="RESPONSE_X_XSS_Protection" pattern=".*" />
                    <conditions>
                        <add input="{RESPONSE_CONTENT_TYPE}" pattern="^text/html" negate="true" />
                    </conditions>
                    <action type="Rewrite" value=""/>
                </rule>
            </outboundRules>
        </rewrite>
    </system.webServer>
</configuration>
```

Note that:

* If your site uses a mime type different than `text/html` to serve
  HTML content (e.g.: `application/xhtml+xml`), you'll have to update
  the value of `pattern`.
* The above snippet works with IIS 7+.
* You should use the above snippet in the `web.config` of your
  application.

For the complete set of configurations, not just for this rule,
see the [IIS server configuration related documentation][iis config].

</details>

## Can the hint be configured?

Yes, you can use:

* `include` to specify additional HTTP headers that should
  be disallowed for non-HTML resources
* `ignore` to specify which of the disallowed HTTP headers
  should be ignored

E.g. The following hint configuration used in the [`.hintrc`][hintrc]
file will make the hint allow non-HTML resources to be served with the
`Content-Security-Policy` HTTP header, but not with `Custom-Header`.

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "no-html-only-headers": [ "warning", {
            "ignore": ["Content-Security-Policy"],
            "include": ["Custom-Header"]
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
        "no-html-only-headers": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

<!-- Apache links -->

[apache config]: https://webhint.io/docs/user-guide/server-configurations/apache/
[apache directory]: https://httpd.apache.org/docs/current/mod/core.html#directory
[header directive]: https://httpd.apache.org/docs/current/mod/mod_headers.html#header
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[how to enable apache modules]: https://github.com/h5bp/server-configs-apache/tree/7eb30da6a06ec4fc24daf33c75b7bd86f9ad1f68#enable-apache-httpd-modules
[htaccess is slow]: https://httpd.apache.org/docs/current/howto/htaccess.html#when
[main apache conf file]: https://httpd.apache.org/docs/current/configuring.html#main
[mod_headers]: https://httpd.apache.org/docs/current/mod/mod_headers.html

<!-- IIS links -->

[iis config]: https://webhint.io/docs/user-guide/server-configurations/iis/
[url rewrite]: https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/using-the-url-rewrite-module
