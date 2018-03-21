# Require highest available document mode (`@sonarwhal/rule-highest-available-document-mode`)

`highest-available-document-mode` warns against not informing browsers
that support document modes to use the highest one available.

## Why is this important?

Internet Explorer 8/9/10 support [document compatibility modes][doc
modes]. Because of this, even if the site’s visitor is using, let’s
say, Internet Explorer 9, it’s possible that Internet Explorer will
not use the latest rendering engine, and instead, decide to render
your page using the Internet Explorer 5.5 rendering engine.

Serving the page with the following HTTP response header:

```text
X-UA-Compatible: ie=edge
```

or specifying the `x-ua-compatible` meta tag:

```html
<meta http-equiv="x-ua-compatible" content="ie=edge">
```

will force Internet Explorer 8/9/10 to render the page in the highest
available mode in [the various cases when it may not][ie complications],
and therefore, ensure that anyone browsing the site from those browsers
is treated to the best possible user experience that browser can offer.

If possible, it is recommended to send the HTTP response header
instead of using the `meta` tag, as the latter will not always work
(e.g.: if the site is served on a non-standard port, as Internet
Explorer’s preference option `Display intranet sites in Compatibility
View` is checked by default).

Notes:

* If the `meta` is used, it should to be included in the `<head>`
  before all other tags except for the `<title>` and the other
  `<meta>` tags.

* Appending `chrome=1` to the value of the HTTP response header or
  the meta tag is no longer recommended as [`Chrome Frame` has been
  deprecated][chrome frame] for quite some time.

## What does the rule check?

By default the rule checks if the `X-UA-Compatible` response header is
sent with the value of `IE=edge`, and that the `meta` tag isn’t used.

### Examples that **trigger** the rule for defaults

`X-UA-Compatible` response header is not sent:

```text
HTTP/... 200 OK

...
```

`X-UA-Compatible` response header is sent with a value different
than `ie=edge`:

```text
HTTP/... 200 OK

...
X-UA-Compatible: IE=7
```

```text
HTTP/... 200 OK

...
X-UA-Compatible: ie=edge,chrome=1
```

`X-UA-Compatible` response header is sent, but the `meta` tag is
also specified:

```text
HTTP/... 200 OK

...
X-UA-Compatible: ie=edge
```

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>example</title>
        ...
    </head>
    <body>...</body>
</html>
```

### Examples that **pass** the rule for defaults

```text
HTTP/... 200 OK

...
X-UA-Compatible: ie=edge
```

The rule [can be configured](#can-the-rule-be-configured) to require
the `X-UA-Compatible` meta tag. This option is indicated mainly for the
case when the HTTP response header cannot be set.

### Examples that **trigger** the rule

`X-UA-Compatible` meta tag is not specified:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        ...
    </head>
    <body>...</body>
</html>
```

`X-UA-Compatible` meta tag is specified with a value different than
`ie=edge`:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=9">
        <title>example</title>
        ...
    </head>
    <body>...</body>
</html>
```

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge,chrome=1">
        <title>example</title>
        ...
    </head>
    <body>...</body>
</html>
```

`X-UA-Compatible` meta tag is specified in the `<body>`:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        ...
    </head>
    <body>
        ...
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        ...
    </body>
</html>
```

`X-UA-Compatible` meta tag is specified in the `<head>`, but it’s
not included before all other tags except for the `<title>` and the
other `<meta>` tags:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        <script src="example.js"></script>
        <meta http-equiv="x-ua-compatible" content="ie=9">
        ...
    </head>
    <body>...</body>
</html>
```

### Examples that **pass** the rule

```text
HTTP/... 200 OK

...
X-UA-Compatible: ie=edge
```

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>example</title>
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <script src="example.js"></script>
        ...
    </head>
    <body>...</body>
</html>
```

## How to configure the server to pass this rule

<!-- markdownlint-disable MD033 -->
<details><summary>How to configure Apache</summary>

Apache can be configured to add or remove the `X-UA-Compatible`
header using the [`Header` directive][header directive].

### Adding the `X-UA-Compatible` header on Apache

```apache
<IfModule mod_headers.c>

    # Because `mod_headers` cannot match based on the content-type,
    # and the `X-UA-Compatible` response header should only be sent
    # for HTML documents and not for the other resources, the following
    # workaround needs to be done.

    # 1) Add the header to all resources.

    Header set X-UA-Compatible "IE=edge"

    # 2) Remove the header for all resources that should not have it.

    <FilesMatch "\.(appcache|atom|bbaw|bmp|crx|css|cur|eot|f4[abpv]|flv|geojson|gif|htc|ic[os]|jpe?g|m?js|json(ld)?|m4[av]|manifest|map|markdown|md|mp4|oex|og[agv]|opus|otf|pdf|png|rdf|rss|safariextz|svgz?|swf|topojson|tt[cf]|txt|vcard|vcf|vtt|webapp|web[mp]|webmanifest|woff2?|xloc|xml|xpi)$">
        Header unset X-UA-Compatible
    </FilesMatch>

</IfModule>
```

## Removing the `X-UA-Compatible` header on Apache

If the header is sent, in most cases, to make Apache stop sending
the `X-UA-Compatible` requires just removing the configuration that
adds it (i.e.: something such as `Header set X-UA-Compatible
"IE=edge"`). However, if the header is added from somewhere in the
stack (e.g. the framework level, language level such as PHP, etc.),
and that cannot be changed, you can try to remove it at the `Apache`
level, using the following:

```apache
<IfModule mod_headers.c>
    Header unset X-UA-Compatible
</IfModule>
```

Note that:

* The above snippets work with Apache `v2.2.0+`, but you need to have
  [`mod_headers`][mod_headers] [enabled][how to enable apache modules]
  in order for them to take effect.

* If you have access to the [main Apache configuration file][main
  apache conf file] (usually called `httpd.conf`), you should add
  the logic in, for example, a [`<Directory>`][apache directory]
  section in that file. This is usually the recommended way as
  [using `.htaccess` files slows down][htaccess is slow] Apache!

  If you don't have access to the main configuration file (quite
  common with hosting services), just add the snippets in a `.htaccess`
  file in the root of the web site/app.

</details>
<details><summary>How to configure IIS</summary>

### Adding the `X-UA-Compatible` header on IIS

To add the `X-UA-Compatible` header you can use a [`URL rewrite` rule][url rewrite]
rule that matches the `text/html` `content-type` header of a response and adds it:

```xml
<configuration>
     <system.webServer>
        <rewrite>
            <outboundRules>
                <rule name="X-UA-Compatible header">
                    <match serverVariable="RESPONSE_X_UA_Compatible" pattern=".*" />
                    <conditions>
                        <add input="{RESPONSE_CONTENT_TYPE}" pattern="^text/html" />
                    </conditions>
                    <action type="Rewrite" value="IE=edge"/>
                </rule>
            </outboundRules>
        </rewrite>
    </system.webServer>
</configuration>
```

Note that if your site uses a mime type different than `text/html`
(e.g.: `application/xhtml+xml`) to serve HTML content, you'll have to
update the value of `pattern`.

## Removing the `X-UA-Compatible` header on IIS

If the header is set by IIS using the above technique, removing the code
should be enough to stop sending it.

If the header is set at the application level you can use the following:

```xml
<configuration>
     <system.webServer>
        <httpProtocol>
             <customHeaders>
                <remove name="X-UA-Compatible"/>
             </customHeaders>
         </httpProtocol>
    </system.webServer>
</configuration>
```

Note that:

* The above snippet works with IIS 7+.
* You should use the above snippet in the `web.config` of your
  application.

</details>

<!-- markdownlint-enable MD033 -->

## Can the rule be configured?

`requireMetaTag` can be set to `true` to allow and require the use of
`meta` tag.

In the [`.sonarwhalrc`][sonarwhalrc] file:

```json
{
    "connector": {...},
    "formatters": [...],
    "rules": {
        "highest-available-document-mode": [ "warning", {
            "requireMetaTag": true
        }],
        ...
    },
    ...
}
```

Also, note that this rule takes into consideration the [targeted
browsers](../index.md#browser-configuration), and if Internet Explorer
8/9/10 aren’t among them, it will suggest removing the `meta` tag or/and
not sending the HTTP response header.

## Further Reading

* [Internet Explorer 8/9/10 Complications][ie complications]
* [Specifying legacy document modes](https://msdn.microsoft.com/en-us/library/jj676915.aspx)

<!-- Link labels: -->

[chrome frame]: https://blog.chromium.org/2013/06/retiring-chrome-frame.html
[doc modes]: https://msdn.microsoft.com/en-us/library/cc288325.aspx
[ie complications]: https://hsivonen.fi/doctype/#ie8
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/

<!-- Apache links -->

[apache directory]: https://httpd.apache.org/docs/current/mod/core.html#directory
[header directive]: https://httpd.apache.org/docs/current/mod/mod_headers.html#header
[how to enable apache modules]: https://github.com/h5bp/server-configs-apache/wiki/How-to-enable-Apache-modules
[htaccess is slow]: https://httpd.apache.org/docs/current/howto/htaccess.html#when
[main apache conf file]: https://httpd.apache.org/docs/current/configuring.html#main
[mod_headers]: https://httpd.apache.org/docs/current/mod/mod_headers.html
[mod_mime]: https://httpd.apache.org/docs/current/mod/mod_mime.html

<!-- IIS Links -->
[url rewrite]: https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/using-the-url-rewrite-module
