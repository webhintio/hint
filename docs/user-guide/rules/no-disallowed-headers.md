# Disallow certain HTTP headers (`no-disallowed-headers`)

`no-disallowed-headers` warns against responding with certain HTTP
headers.

## Why is this important?

There are certain HTTP headers that should not be sent:

1) Headers that are often set by servers, frameworks, and server-side
languages (e.g.: ASP.NET, PHP), that by default have values that
contain information about the technology that set them: its name,
version number, etc.

   Sending these types of HTTP headers does not provide any value to
users, contributes to header bloat, and just gives more information
to any potential attackers about the technology stack being used.

2) Headers that have limited support, require a lot of knowledge to
make them work correctly, and can easily create more problems then
they solve.

   One example here is the `Public-Key-Pins` header. It has [limited
support and usage, it’s being deprecated (along with the related
`Public-Key-Pins-Report-Only` header), and can easily create a lot
of problems if not done correctly][hpkp deprecation].

## What does the rule check?

By default, the rule checks if responses include one of the following
HTTP headers:

* `Public-Key-Pins`
* `Public-Key-Pins-Report-Only`
* `X-AspNet-Version`
* `X-AspNetMvc-version`
* `X-Powered-By`
* `X-Runtime`
* `X-Version`

or the `Server` header with a value that provides a lot of information,
and is not limited to the server name.

### Examples that **trigger** the rule

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

### Examples that **pass** the rule

```text
HTTP/... 200 OK

...
Server: apache
X-Powered-By: PHP/5.3.28
```

```text
HTTP/... 200 OK

...
```

## How to configure the server to pass this rule

<!-- markdownlint-disable MD033 -->

<details>
<summary>How to configure Apache</summary>

If the headers are sent, in most cases, to make Apache stop sending
them requires just removing the configurations that tells Apache to
add them (e.g. for the `X-UA-Compatible` header, that would be mean
removing something such as `Header set X-UA-Compatible "IE=edge"`).
However, if the headers are added from somewhere in the stack (e.g.:
the framework level, language level such as PHP, etc.), and that cannot
be changed, you can try to remove them at the `Apache` level, using
the following:

```apache
<IfModule mod_headers.c>
    Header unset Public-Key-Pins
    Header unset Public-Key-Pins-Report-Only
    Header unset X-AspNet-Version
    Header unset X-AspNetMvc-version
    Header unset X-Powered-By`
    Header unset X-Runtime
    Header unset X-Version
</IfModule>
```

When it comes to the `Server` header, by default, [Apache does not
allow removing it](https://bz.apache.org/bugzilla/show_bug.cgi?id=40026)
(the only way to do that is by using an external module). However,
Apache can be configured using the [`ServerTokens` directive][servertokens]
to provide less information thought the `Server` header.

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

* The above snippets works with Apache `v2.2.0+`, but you need to have
  [`mod_headers`][mod_headers] [enabled][how to enable apache modules]
  in order for them to take effect.

* If you have access to the [main Apache configuration file][main
  apache conf file] (usually called `httpd.conf`), you should add
  the logic in, for example, a [`<Directory>`][apache directory]
  section in that file. This is usually the recommended way as
  [using `.htaccess` files slows down][htaccess is slow] Apache!

  If you don't have access to the main configuration file (quite
  common with hosting services), just add the first snippets in a
  `.htaccess` file in the root of the web site/app.

</details>

<!-- markdownlint-enable MD033 -->

## Can the rule be configured?

Yes, you can use:

* `include` to specify additional HTTP headers that should
  be disallowed
* `ignore` to specify which of the disallowed HTTP headers
  should be ignored

E.g. The following configuration will make the rule allow responses to
be served with the `Server` HTTP header, but not with `Custom-Header`.

```json
"no-disallowed-headers": [ "warning", {
    "ignore": ["Server"],
    "include": ["Custom-Header"]
}]
```

<!-- Link labels: -->

[hpkp deprecation]: https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/he9tr7p3rZ8/eNMwKPmUBAAJ

<!-- Apache links -->

[apache directory]: https://httpd.apache.org/docs/current/mod/core.html#directory
[how to enable apache modules]: https://github.com/h5bp/server-configs-apache/wiki/How-to-enable-Apache-modules
[htaccess is slow]: https://httpd.apache.org/docs/current/howto/htaccess.html#when
[main apache conf file]: https://httpd.apache.org/docs/current/configuring.html#main
[mod_headers]: https://httpd.apache.org/docs/current/mod/mod_headers.html
[servertokens]: https://httpd.apache.org/docs/current/mod/core.html#servertokens
