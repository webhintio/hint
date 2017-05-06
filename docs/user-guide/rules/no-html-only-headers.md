# Disallow unneeded HTTP headers for non-HTML resources (`no-html-only-headers`)

`no-html-only-headers` warns against responding with HTTP headers that
are not needed for non-HTML resources.

## Why is this important?

Some HTTP headers do not make sense to be send for non-HTML
resources, as sending them does not provide any value to users,
and just contributes to header bloat.

## What does the rule check?

The rule checks if non-HTML responses include any of the following
HTTP headers:

* `Content-Security-Policy`
* `X-Content-Security-Policy`
* `X-Frame-Options`
* `X-UA-Compatible`
* `X-WebKit-CSP`
* `X-XSS-Protection`

Examples that **trigger** the rule:

Response for `/test.js`:

```text
HTTP/1.1 200 OK

Content-Type: application/javascript
...
Content-Security-Policy: default-src 'none'
Content-Type: application/javascript; charset=utf-8
X-Content-Security-Policy: default-src 'none'
X-Frame-Options: DENY
X-UA-Compatible: IE=Edge,
X-WebKit-CSP: default-src 'none'
X-XSS-Protection: 1; mode=block
...
```

Response for `/test.html`:

```text
HTTP/1.1 200 OK

Content-Type: x/y
...
Content-Security-Policy: default-src 'none'
Content-Type: application/javascript; charset=utf-8
X-Content-Security-Policy: default-src 'none'
X-Frame-Options: DENY
X-UA-Compatible: IE=Edge,
X-WebKit-CSP: default-src 'none'
X-XSS-Protection: 1; mode=block
...
```

Examples that **pass** the rule:

Response for `/test.js`:

```text
HTTP/1.1 200 OK

Content-Type: application/javascript
...
```

Response for `/test.html`:

```text
HTTP/1.1 200 OK

Content-Type: text/html
...
Content-Security-Policy: default-src 'none'
Content-Type: application/javascript; charset=utf-8
X-Content-Security-Policy: default-src 'none'
X-Frame-Options: DENY
X-UA-Compatible: IE=Edge,
X-WebKit-CSP: default-src 'none'
X-XSS-Protection: 1; mode=block
...
```

## Can the rule be configured?

Yes, you can use:

* `include` to specify additional HTTP headers that should
  be disallowed for non-HTML resources
* `ignore` to specify which of the disallowed HTTP headers
  should be ignored

E.g. The following configuration will make the rule allow non-HTML
resources to be served with the `Content-Security-Policy` HTTP header,
but not with `Custom-Header`.

```json
"no-html-only-headers": [ "warning", {
    "ignore": ["Content-Security-Policy"],
    "include": ["Custom-Header"]
}]
```
