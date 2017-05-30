# Require `Content-Type` HTTP response header with appropriate value (`content-type`)

`content-type` warns against not serving resources with the
`Content-Type` HTTP response header with a value containing
the appropriate media type and charset for the response.

## Why is this important?

Even thought browsers sometimes [ignore](https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Configuring_server_MIME_types))
the value of the `Content-Type` header and try to [sniff the content](https://mimesniff.spec.whatwg.org/),
it's indicated to always send the appropriate media type and charset
for the response as, among other:

* [resources served with the wrong media type may be
  blocked](https://www.fxsitecompat.com/en-CA/docs/2016/javascript-served-with-wrong-mime-type-will-be-blocked/)
  (see also: [`X-Content-Type-Options` rule](x-content-type-options.md)),
  or the official [media type may be required](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache#Referencing_a_cache_manifest_file)

* not sending the appropriate `charset`, where appropriate, may [prevent
  things from being rendered correctly](https://www.w3.org/International/questions/qa-what-is-encoding),
  thus creating a bad user experience (see also:
  [`meta-charset-utf-8` rule](meta-charset-utf-8.md))

## What does the rule check?

The rule checks if responses include the `Content-Type` HTTP response
header and its value contains the appropiate media type and charset
for the response.

### Examples that **trigger** the rule

`Content-Type` response header is not sent:

```text
HTTP/... 200 OK

...
```

`Content-Type` response header is sent with an invalid value:

```text
HTTP/... 200 OK

...
Content-Type: invalid
```

```text
HTTP/... 200 OK

...
Content-Type: text/html;;;
```

`Content-Type` response header is sent with the wrong media type:

For `/example.png`

```text
HTTP/... 200 OK

...
Content-Type: font/woff2
```

`Content-Type` response header is sent with an unofficial media type:

For `/example.js`

```text
HTTP/... 200 OK

...
Content-Type: application/x-javascript; charset=utf-8
```

`Content-Type` response header is sent without the `charset` parameter
for response that should have it:

For `/example.html`

```text
HTTP/... 200 OK

...
Content-Type: text/html
```

### Examples that **pass** the rule

For `/example.png`

```text
HTTP/... 200 OK

...
Content-Type: image/png
```

For `/example.js`

```text
HTTP/... 200 OK

...
Content-Type: application/javascript; charset=utf-8
```

## Can the rule be configured?

You can overwrite the defaults by specifying custom values for the
`Content-Type` header and the regular expressions that match the URLs
for which those values should be required.

`<regex>: <content_type_value>`

E.g. The following configuration will make `sonar` require that
all resources requested from a URL that matches the regular expression
`.*\.js` be served with a `Content-Type` header with the value of
`text/javascript; charset=utf-8`.

```json
"content-type": [ "warning", {
    ".*\\.js": "text/javascript; charset=utf-8"
}]
```

Note: You can also use the [`ignoredUrls`](../index.md#rule-configuration)
property from the `.sonarrc` file to exclude domains you don't control
(e.g.: CDNs) from these checks.

## Further Reading

* [Setting the HTTP charset parameter](https://www.w3.org/International/articles/http-charset/index)
