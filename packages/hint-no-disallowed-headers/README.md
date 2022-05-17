# Disallowed HTTP headers (`no-disallowed-headers`)

`no-disallowed-headers` warns against responding with certain HTTP
headers.

## Why is this important?

There are certain HTTP headers that should not be sent:

1) Headers that are often set by servers, frameworks, and server-side
   languages (e.g.: ASP.NET, PHP), that by default have values that
   contain information about the technology that set them: its name,
   version number, etc.

Sending these types of HTTP headers:

* does not provide any value to the user experience
* contributes to header bloat
* exposes information to potential attackers about
  the technology stack being used

2) Uncommon or esoteric headers that have limited support, require
   a lot of knowledge to use correctly, and can create more problems
   than they solve.

   One example here is the `Public-Key-Pins` header. It has [limited
   support and usage, it’s being deprecated (along with the related
   `Public-Key-Pins-Report-Only` header) and can easily create a lot
   of problems if not done correctly][hpkp deprecation].

## What does the hint check?

By default, the hint checks if responses include one of the following
HTTP headers:

* `Expires`
* `Host`
* `P3P`
* `Pragma`
* `Public-Key-Pins`
* `Public-Key-Pins-Report-Only`
* `X-AspNet-Version`
* `X-AspNetMvc-version`
* `X-Frame-Options`
* `X-Powered-By`
* `X-Runtime`
* `X-Version`

or the `Server` header with a value that provides a lot of information
and is not limited to the server name.

### Examples that **trigger** the hint

```text
HTTP/... 200 OK

...
Server: Apache/2.2.27 (Unix) mod_ssl/2.2.27 OpenSSL/1.0.1e-fips mod_bwlimited/1.4
X-Powered-By: PHP/5.3.28
```

```text
HTTP/... 200 OK

...
Public-Key-Pins-Report-Only:
  pin-sha256="MoScTAZWKaASuYWhhneDttWpY3oBAkE3h2+soZS7sWs=";
  pin-sha256="C5HTzCzM3elUxkcjR2S5P4hhyBNf6lHkmjAHKhpGPWE=";
  includeSubDomains;
  report-uri="https://www.example.com/hpkp-report"
```

### Examples that **pass** the hint

```text
HTTP/... 200 OK

...
Server: apache
```

```text
HTTP/... 200 OK

...
```

## How to configure the server to pass this hint

<details><summary>How to configure Apache</summary>

If the headers are sent, in most cases, to make Apache stop sending
them requires removing the configurations that tells Apache to add
them (e.g. for the `X-UA-Compatible` header, that would be mean
removing something such as `Header set X-UA-Compatible "IE=edge"`).
However, if the headers are added from somewhere in the stack (e.g.:
the framework level, language level such as PHP, etc.), and that cannot
be changed, you can try to remove them at the `Apache` level, using
the following:

```apache
<IfModule mod_headers.c>
    Header unset Expires
    Header unset Host
    Header unset P3P
    Header unset Pragma
    Header unset Public-Key-Pins
    Header unset Public-Key-Pins-Report-Only
    Header unset Via
    Header unset X-AspNet-Version
    Header unset X-AspNetMvc-version
    Header unset X-Frame-Options
    Header unset X-Powered-By
    Header unset X-Runtime
    Header unset X-Version
</IfModule>
```

When it comes to the `Server` header, by default, [Apache does not
allow removing it][apache issue 40026] (the only way to do that is
by using an external module). However, Apache can be configured using
the [`ServerTokens` directive][servertokens] to provide less
information thought the `Server` header.

Note: The following snippet will only work in the main Apache
configuration file, so don't try to include it in a `.htaccess` file!

```apache
# Prevent Apache from sending in the `Server` response header its
# exact version number, the description of the generic OS-type or
# information about its compiled-in modules.
#
# https://httpd.apache.org/docs/current/mod/core.html#servertokens

ServerTokens Prod
```

Note that:

* The above snippets work with Apache `v2.2.0+`, but you need to have
  [`mod_headers`][mod_headers] [enabled][how to enable apache modules]
  for them to take effect.

* If you have access to the [main Apache configuration file][main
  apache conf file] (usually called `httpd.conf`), you should add
  the logic in, for example, a [`<Directory>`][apache directory]
  section in that file. This is usually the recommended way as
  [using `.htaccess` files slows down][htaccess is slow] Apache!

  If you don't have access to the main configuration file (quite
  common with hosting services), add the first snippets in a
  `.htaccess` file in the root of the web site/app.

</details>
<details><summary>How to configure IIS</summary>

To add or remove headers on IIS, you can use the
[`<customHeader> element`][customheader] and `<remove>/<add>`
depending on what you need.

The following snippet will remove the headers from all responses:

```xml
<configuration>
     <system.webServer>
        <httpProtocol>
             <customHeaders>
                <remove name="Expires"/>
                <remove name="Host"/>
                <remove name="P3P"/>
                <remove name="Pragma"/>
                <remove name="Public-Key-Pins"/>
                <remove name="Public-Key-Pins-Report-Only"/>
                <remove name="Via"/>
                <remove name="X-Frame-Options"/>
                <remove name="X-Powered-By"/>
                <remove name="X-Runtime"/>
                <remove name="X-Version"/>
             </customHeaders>
         </httpProtocol>
    </system.webServer>
    <system.web>
        <!-- X-AspNet-Version, only needed if running an AspNet app -->
        <httpRuntime enableVersionHeader="false" />
    </system.web>
</configuration>
```

To remove the header `X-AspNetMvc-version`, open your `Global.asax`
file and add the following to your `Application_Start` event:

```c#
MvcHandler.DisableMvcResponseHeader = true;
```

Removing the `Server` header is a bit more complicated and changes
depending on the version.

In IIS 10.0 you can remove it using the [`removeServerHeader` attribute
of `requestFiltering`][request filtering]:

```xml
<configuration>
     <system.webServer>
        <security>
            <requestFiltering removeServerHeader ="true" />
        </security>
    </system.webServer>
</configuration>
```

For previous versions of IIS (7.0-8.5) you can use the following:

```xml
<configuration>
     <system.webServer>
        <rewrite>
            <outboundRules rewriteBeforeCache="true">
                <rule name="Remove Server header">
                    <match serverVariable="RESPONSE_Server" pattern=".+" />
                    <action type="Rewrite" value="" />
                </rule>
            </outboundRules>
        </rewrite>
    </system.webServer>
</configuration>
```

The above snippet will use a [`URL rewrite`][url rewrite] rule to
remove the `Server` header from any request that contains it.

</details>

## Can the hint be configured?

Yes, you can use:

* `include` to specify additional HTTP headers that should
  be disallowed
* `ignore` to specify which of the disallowed HTTP headers
  should be ignored

E.g. The following hint configuration used in the [`.hintrc`][hintrc]
file will make the hint allow responses to be served with the `Server`
HTTP header, but not with `Custom-Header`.

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "no-disallowed-headers": [ "warning", {
            "ignore": ["Server"],
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
        "no-disallowed-headers": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

<!-- Link labels: -->

[hpkp deprecation]: https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/he9tr7p3rZ8/eNMwKPmUBAAJ
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/

<!-- Apache links -->

[apache directory]: https://httpd.apache.org/docs/current/mod/core.html#directory
[apache issue 40026]: https://bz.apache.org/bugzilla/show_bug.cgi?id=40026
[how to enable apache modules]: https://github.com/h5bp/server-configs-apache/tree/7eb30da6a06ec4fc24daf33c75b7bd86f9ad1f68#enable-apache-httpd-modules
[htaccess is slow]: https://httpd.apache.org/docs/current/howto/htaccess.html#when
[main apache conf file]: https://httpd.apache.org/docs/current/configuring.html#main
[mod_headers]: https://httpd.apache.org/docs/current/mod/mod_headers.html
[servertokens]: https://httpd.apache.org/docs/current/mod/core.html#servertokens

<!-- IIS links -->

[customheader]: https://docs.microsoft.com/en-us/iis/configuration/system.webserver/httpprotocol/customheaders/
[request filtering]: https://docs.microsoft.com/en-us/iis/configuration/system.webserver/security/requestfiltering/#new-in-iis-100
[url rewrite]: https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/using-the-url-rewrite-module
