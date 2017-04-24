# Require `X-Content-Type-Options` HTTP response header (`x-content-type-options`)

`x-content-type-options` warns against not serving resources with the
`X-Content-Type-Options: nosniff` HTTP response header.


## Why is this important?

Sometimes the metadata browsers need in order to know how to interpret
the content of a resource is incorrect, not reliable, or even absent.
So, in order to overcome those problems and provide a better user
experience, regardless of the specified `Content-Type` HTTP header sent
by servers, browsers use contextual clues and inspect the bytes of the
response (known as [MIME sniffing](https://mimesniff.spec.whatwg.org/))
in order to detect the file format.

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
`style`s](https://fetch.spec.whatwg.org/#should-response-to-request-be-blocked-due-to-nosniff%3F)
(see also [whatwg/fetch#395](https://github.com/whatwg/fetch/issues/395).

Going back to the previous example, if the `X-Content-Type-Options: nosniff`
header is sent for the script, if the browser detects that its a script
and it wasn't served with one of the [JavaScript media
type](https://html.spec.whatwg.org/multipage/scripting.html#javascript-mime-type),
it will block it.


## What does the rule check?

The rule checks if responses include the `X-Content-Type-Options`
HTTP headers with the value of `nosniff`.

Examples that **trigger** the rule:

```text
HTTP/1.1 200 OK

...
```

```text
HTTP/1.1 200 OK

...
X-Content-Type-Options: no-sniff
```

Examples that **pass** the rule:

```text
HTTP/1.1 200 OK

...
X-Content-Type-Options: nosniff
```


## Further Reading

* [`X-Content-Type-Options` header](https://fetch.spec.whatwg.org/#x-content-type-options-header)
* [Reducing MIME type security risks](https://msdn.microsoft.com/en-us/library/gg622941.aspx)
* [Mitigating MIME Confusion Attacks in Firefox](https://blog.mozilla.org/security/2016/08/26/mitigating-mime-confusion-attacks-in-firefox/)
* [Script Polyglots](https://blogs.msdn.microsoft.com/ieinternals/2014/11/24/script-polyglots/) the correct interpretation of it solely depending on the context).
* [IE8 Security Part V: Comprehensive Protection](https://blogs.msdn.microsoft.com/ie/2008/07/02/ie8-security-part-v-comprehensive-protection/)
