# Require `Strict-Transport-Security` response header (`strict-transport-security`)

`strict-transport-security` warns against serving resources over HTTPS without
`strict-transport-security` header and validates the header directives
and their corresponding values.

## Why is this important?

Web security has been a crutial concern for the developers nowadays. Unlike
[cross-site scripting (XSS)][XSS] and [SQL injection](SQL injection), the
exploit of insufficient protection over the transport layer can be harder to picture
in practice. If a website accepts a connection through HTTP and then redirects to HTTPS,
it opens up opportunites for a "man-in-the-middle" attack, when the redirect could be
exploited and lead the user to a malicious site.

By specifying the `Strict-Transport-Security` header along with a `max-age` value in
the reponse, a website is able to declare themselves to be only accessible via the
secure connections within the specified time period. So for future attempts to the
same domain via the insecure connections, the browswer knows that it should never
load the site using HTTP and automatically convert all attempts to HTTPS requests instead.

Notably, to prevent the `Strict-Transport-Security` header from being stripped by
the attacker on the user's first visit, major browsers include a "pre-loaded" list
of sites that must be loaded via HTTPS. You can submit your domain name in the
[online form][preload form] to be included in the list. After being included,
browsers will never be able to connect to your domain using an insecure connection.
So use with great caution: Before you decide to have your own domain included, make
sure that you are able to support HTTPS for all the subdomains and will never again
need the insecure scheme.

More information about HTTP Strict Transport (HSTS), please see:

* [HTTP Strict Transport Security wiki][HSTS wiki]
* [HTTP Strict Transport Security Cheat Sheet][HSTS cheat sheat]

## What does the rule check?

For a site served over HTTPS, this rule checks the following:

* If it has a `Strict-Transport-Security` header.
* If the header has the required `max-age` directive.
* If the `max-age` directive has a value that is longer than 18 weeks(10886400s).
* If `Strict-Transport-Security` header has repetitive directives.
* When a `Strict-Transport-Security` header contains `preload` directive, this rule

will first check the domain name against the [HTTP Strict Transport Security (HSTS) preload list][preload list]
for the preload status, and then check whether this domain has errors that would prevent
preloading by calling the hstspreload api endpoint. This check is disabled by default.

### Examples that **trigger** the rule

`Strict-Transport-Security` response header was not sent over `HTTPS`:

```text
HTTP/... 200 OK

...
```

`Strict-Transport-Security` response header is sent with a `max-age` value that is too short:

```text
HTTP/... 200 OK

...
Strict-Transport-Security: max-age=1
```

`Strict-Transport-Security` response header is sent without `max-age` directive:

```text
HTTP/... 200 OK

...
Strict-Transport-Security: maxage=31536000
```

`Strict-Transport-Security` response header is sent with duplicate `includeSubDomains` directives:

```text
HTTP/... 200 OK

...
Strict-Transport-Security: includeSubDomains; max-age=31536000; includeSubDomains
```

### Examples that **pass** the rule

```text
HTTP/... 200 OK

...
Strict-Transport-Security: max-age=31536000
```

```text
HTTP/... 200 OK

...
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

```text
HTTP/... 200 OK

...
 Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## Can the rule be configured?

Yes, you can configure the value that `max-age` is checked against with. By default,
this limit is set as 18 weeks (10886400s);

E.g. The following configuration will change the `max-age` value limit to `123456`.

```json
"strict-transport-security": ["error", {
    "minMaxAgeValue": 123456
}]
```

Also, you can configure the rule so that if `preload` directive is included in the header,
it will check whether this domain has errors that would prevent preloading by calling the
hstspreload api endpoint. This validation is disabled by default.

E.g. The following configuration will enable the `preload` validation.

```json
"strict-transport-security": ["error", {
    "checkPreload": true
}]
```

## Further Reading

* [The beginners guide to breaking website security with nothing more than a Pineapple][pineapple]
* [Understanding HTTP Strict Transport Security(HSTS) and preloading it into the browser][understading HSTS]

[XSS]: https://www.owasp.org/index.php/Cross-site_Scripting_%28XSS%29
[SQL injection]: https://www.owasp.org/index.php/SQL_Injection
[HSTS wiki]: https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security
[HSTS cheat sheat]: https://www.owasp.org/index.php/HTTP_Strict_Transport_Security_Cheat_Sheet
[pineapple]: https://www.troyhunt.com/the-beginners-guide-to-breaking-website/
[understading HSTS]: https://www.troyhunt.com/understanding-http-strict-transport/
[preload form]:https://hstspreload.org/
[preload list]:https://cs.chromium.org/codesearch/f/chromium/src/net/http/transport_security_state_static.json
