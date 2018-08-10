# Require `X-Content-Type-Options` HTTP response header (`x-content-type-options`)

`x-content-type-options` requires that all scripts and
stylesheets are served with the `X-Content-Type-Options: nosniff`
HTTP response header.

## Why is this important?

Sometimes the metadata browsers need to know how to interpret the
content of a resource is either incorrect, not reliable, or absent.
In those cases, browsers use contextual clues that inspect the bytes
of the response to detect the file format. This is known as [MIME
sniffing][mime sniffing spec] and it is done regardless of the specified
`Content-Type` HTTP header sent by servers.

For example, if a browser requests a script, but that script is served
with an incorrect media type (e.g. `x/x`), the browser will still detect
the script and execute it.

While content sniffing can be beneficial, it can also expose the web
site/app to attacks based on MIME-type confusion leading to security
problems, especially in the case of servers hosting untrusted content.

Fortunately, browsers provide a way to opt-out of MIME sniffing by
using the `X-Content-Type-Options: nosniff` HTTP response header.

Going back to the previous example, if the `X-Content-Type-Options: nosniff`
header is sent for the script and the browser detects that it’s a script
and it wasn’t served with one of the [JavaScript media types][javascript
media types], the script will be blocked.

Note: [Modern browsers only respect the header for scripts and
stylesheets][fetch spec blocking] and sending the header for other
resources (such as images) when they are served with the wrong media
type may [create problems in older browsers][fetch spec issue].

## What does the hint check?

The hint checks if all scripts and stylesheets are served with the
`X-Content-Type-Options` HTTP headers with the value of `nosniff`.

### Examples that **trigger** the hint

Resource that is not script or stylesheet is served with the
`X-Content-Type-Options` HTTP header.

```text
HTTP/... 200 OK

...

Content-Type: image/png
X-Content-Type-Options: nosniff
```

Script is served with the `X-Content-Type-Options` HTTP header
with the invalid value of `no-sniff`.

```text
HTTP/... 200 OK

...
Content-Type: text/javascript; charset=utf-8
X-Content-Type-Options: no-sniff
```

### Examples that **pass** the hint

Script is served with the `X-Content-Type-Options` HTTP header
with the valid value of `nosniff`.

```text
HTTP/... 200 OK

...
Content-Type: text/javascript; charset=utf-8
X-Content-Type-Options: nosniff
```

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-x-content-type-options
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "x-content-type-options": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

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
[hintrc]: https://webhint.io/docs/user-guide/further-configuration/hintrc-formats/

<!-- Apache links -->

[apache directory]: https://httpd.apache.org/docs/current/mod/core.html#directory
[header directive]: https://httpd.apache.org/docs/current/mod/mod_headers.html#header
[how to enable apache modules]: https://github.com/h5bp/server-configs-apache/wiki/How-to-enable-Apache-modules
[htaccess is slow]: https://httpd.apache.org/docs/current/howto/htaccess.html#when
[main apache conf file]: https://httpd.apache.org/docs/current/configuring.html#main
[mod_headers]: https://httpd.apache.org/docs/current/mod/mod_headers.html
[mod_mime]: https://httpd.apache.org/docs/current/mod/mod_mime.html

<!-- IIS links -->

[url rewrite]: https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/using-the-url-rewrite-module
