# Require `X-Content-Type-Options` HTTP response header (`x-content-type-options`)

`x-content-type-options` warns against not serving resources with the
`X-Content-Type-Options: nosniff` HTTP response header.

## Why is this important?

Sometimes the metadata browsers need in order to know how to interpret
the content of a resource is incorrect, not reliable, or even absent.
So, in order to overcome those problems and provide a better user
experience, regardless of the specified `Content-Type` HTTP header sent
by servers, browsers use contextual clues and inspect the bytes of the
response (known as [MIME sniffing][mime sniffing spec] in order to detect
the file format.

For example, if a browser requests a script, but that script is served
with an incorrect media type (e.g. `x/x`), the browser will still detect
the script and execute it.

While, as previously stated, content sniffing can be beneficial, it
can also expose the web site/app to attacks based on MIME-type confusion
which can lead to security problems, especially in the case of servers
hosting untrusted content.

Fortunately, browsers provide a way to opt-out of MIME sniffing by
using the `X-Content-Type-Options: nosniff` HTTP response header.

Note: [Most modern browsers only respect the header for `script`s and
`style`s][fetch spec blocking] (see also [whatwg/fetch#395][fetch spec
issue].

Going back to the previous example, if the `X-Content-Type-Options: nosniff`
header is sent for the script, if the browser detects that it’s a script
and it wasn’t served with one of the [JavaScript media type][javascript
media types], it will block it.

## What does the rule check?

The rule checks if responses include the `X-Content-Type-Options`
HTTP headers with the value of `nosniff`.

### Examples that **trigger** the rule

```text
HTTP/... 200 OK

...
```

```text
HTTP/... 200 OK

...
X-Content-Type-Options: no-sniff
```

### Examples that **pass** the rule

```text
HTTP/... 200 OK

...
X-Content-Type-Options: nosniff
```

## How to configure the server to pass this rule

<!-- markdownlint-disable MD033 -->
<details>
<summary>How to configure Apache</summary>

Apache can be configured to serve resources with the
`X-Content-Type-Options` header with the value of `nosniff`
using the [`Header` directive][header directive]:

```apache
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
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

## Further Reading

* [`X-Content-Type-Options` header](https://fetch.spec.whatwg.org/#x-content-type-options-header)
* [Reducing MIME type security risks](https://msdn.microsoft.com/en-us/library/gg622941.aspx)
* [Mitigating MIME Confusion Attacks in Firefox](https://blog.mozilla.org/security/2016/08/26/mitigating-mime-confusion-attacks-in-firefox/)
* [Script Polyglots](https://blogs.msdn.microsoft.com/ieinternals/2014/11/24/script-polyglots/)
* [IE8 Security Part V: Comprehensive Protection](https://blogs.msdn.microsoft.com/ie/2008/07/02/ie8-security-part-v-comprehensive-protection/)

<!-- Link labels: -->

[fetch spec blocking]: https://fetch.spec.whatwg.org/#should-response-to-request-be-blocked-due-to-nosniff%3F
[fetch spec issue]: https://github.com/whatwg/fetch/issues/395
[javascript media types]: https://html.spec.whatwg.org/multipage/scripting.html#javascript-mime-type
[mime sniffing spec]: https://mimesniff.spec.whatwg.org/

<!-- Apache links -->

[apache directory]: https://httpd.apache.org/docs/current/mod/core.html#directory
[header directive]: https://httpd.apache.org/docs/current/mod/mod_headers.html#header
[how to enable apache modules]: https://github.com/h5bp/server-configs-apache/wiki/How-to-enable-Apache-modules
[htaccess is slow]: https://httpd.apache.org/docs/current/howto/htaccess.html#when
[main apache conf file]: https://httpd.apache.org/docs/current/configuring.html#main
[mod_headers]: https://httpd.apache.org/docs/current/mod/mod_headers.html
[mod_mime]: https://httpd.apache.org/docs/current/mod/mod_mime.html
