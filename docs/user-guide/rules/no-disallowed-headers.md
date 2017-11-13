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

   One example here is `Public-Key-Pins` header and the related
`Public-Key-Pins-Report-Only`. They have [limited support and usage,
are being deprecated, and can easily create a lot of problems if not
done correctly][hpkp deprecation].

## What does the rule check?

By default, the rule checks if responses include one of the following
HTTP headers:

* `Public-Key-Pins`
* `Public-Key-Pins-Report-Only`
* `Server`
* `X-AspNet-Version`
* `X-AspNetMvc-version`
* `X-Powered-By`
* `X-Runtime`
* `X-Version`

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
```

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
