# Valid `Set-Cookie` header (`validate-set-cookie-header`)

This hint validates the `set-cookie` header and confirms that
the `Secure` and `HttpOnly` directives are defined when sent from
a secure origin (HTTPS).

## Why is this important?

A cookie is a small piece of information sent from a server to
a user agent. The user agent might save it and send it along with
future requests to identify the user session, track and analyze
user behavior or inform the server of the user preferences. As a
result, it contains sensitive data in a lot of the cases. To create
a cookie, the `Set-Cookie` header is sent from a server in response
to requests.

In the `Set-Cookie` header, a cookie is defined by a name associated
with a value. A web server can configure the `domain` and `path`
directives to restrain the scope of cookies. While session cookies
are deleted when a browser shuts down, the permanent cookies expire
at the time defined by `Expires` or `Max-Age`.

Among the directives, the `Secure` and `HttpOnly` attributes are
particularly relevant to the security of cookies:

* Setting `Secure` directive forbids a cookie to be transmitted
  via simple HTTP.
* Setting the `HttpOnly` directive prevents access to cookie value
  through javascript.

Applying both directives makes it difficult to exploit cross-site
scripting ([XSS][xss]) vulnerabilities and hijack the authenticated
user sessions. The [wiki][http cookie wiki] page of `HTTP cookies`
offers detailed examples of [cookie theft][cookie theft] and [proxy
request][proxy request] when cookies are not well protected. According
to the RFC [HTTP State Management Mechanism][HTTP State Management
Mechanism], "When using cookies over a secure channel, servers SHOULD
set the Secure attribute for every cookie". As a result, this hint
checks if `Secure` and `HttpOnly` directives are properly used and
offers to validate the `Set-Cookie` header syntax.

Note: More information about `Set-cookie` header is available in the
[MDN web docs][set-cookie web doc].

## What does the hint check?

* `Secure` and `HttpOnly` cookies:

  * `Secure` and `HttpOnly` directives **should** be present if sites
    are secure.
  * `Secure` directive **should not** be present if sites are insecure.

* Cookie prefixes:

  * `__Secure-` and `__Host-` prefixes **can** be used only if sites
    are secure.
  * Cookies with the `__Host-` prefix **should** have a `path` of "/"
    (the entire host) and **should not** have a `domain` attribute.

    Read more: [cookie prefixes][cookie prefixes].

* Syntax validation:
  * Validate cookie name and value string.
  * Validate `Expires` value date format.

* Browser compatibility of `Max-Age` directive:
  * Some browsers (ie6, ie7, and ie8) don’t support `Max-Age`.

### Examples that **trigger** the hint

`Set-Cookie` header that doesn’t have a name-value string:

```text
HTTP/... 200 OK

...
Set-Cookie: Max-Age=0; Secure; HttpOnly
```

`Set-Cookie` header that doesn’t have the `Secure` directive:

```text
HTTP/... 200 OK

...
Set-Cookie: cookieName=cookieValue; HttpOnly
```

`Set-Cookie` header that doesn’t have the `HttpOnly` directive:

```text
HTTP/... 200 OK

...
Set-Cookie: cookieName=cookieValue; Secure
```

`Set-Cookie` header that has invalid `name` or `value` string:

```text
HTTP/... 200 OK

...
Set-Cookie: "cookieName"=cookieValue; Secure; HttpOnly
```

```text
HTTP/... 200 OK

...
Set-Cookie: cookieName=cookie value; Secure; HttpOnly
```

`Set-Cookie` header that has prefixes in the cookie name but is sent
from pages using `http` protocol:

From an insecure origin (HTTP):

```text
HTTP/... 200 OK

...
Set-Cookie: __Secure-ID=123; Secure; Domain=example.com
```

`Set-Cookie` header that has `__Host-` prefix in the cookie name but
has `Path` absent or `Domain` defined:

```text
HTTP/... 200 OK

...
Set-Cookie: __Host-id=1; Secure
```

```text
HTTP/... 200 OK

...
Set-Cookie: __Host-id=1; Secure; Path=/; domain=example.com
```

### Examples that **pass** the hint

```text
HTTP/... 200 OK

...
Set-Cookie: cookieName=cookieValue; Secure; HttpOnly
```

```text
HTTP/... 200 OK

...
Set-Cookie: cookieName="cookieValue"; Secure; HttpOnly
```

```text
HTTP/... 200 OK

...
Set-Cookie: __Host-ID=123; Secure; Path=/; HttpOnly
```

```text
HTTP/... 200 OK

...
Set-Cookie: __Secure-ID=123; Secure; Domain=example.com; HttpOnly
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
        "validate-set-cookie-header": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

<!-- Link labels: -->

[cookie prefixes]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Cookie_prefixes
[cookie theft]:https://en.wikipedia.org/wiki/HTTP_cookie#Cross-site_scripting:_cookie_theft
[http cookie wiki]:https://en.wikipedia.org/wiki/HTTP_cookie
[HTTP State Management Mechanism]:https://tools.ietf.org/html/rfc6265
[proxy request]:https://en.wikipedia.org/wiki/HTTP_cookie#Cross-site_scripting:_proxy_request
[set-cookie web doc]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[xss]:https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting
