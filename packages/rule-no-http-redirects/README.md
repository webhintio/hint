# Avoid HTTP redirects in requests (`@sonarwhal/rule-no-http-redirects`)

`no-http-redirects` checks if there are any HTTP redirects in the page
`sonarwhal` is analyzing.

## Why is this important?

The following is a simplify version of what happens when the user
requests a URL in a browser:

1. DNS Lookup: Translate the domain to an IP. If the browser doesn’t
   know it, it has to ask a DNS server which in some cases involves
   multiple queries until the final IP is obtained.
1. Open a [TCP connection][wikipedia-tcp-establishement] to the IP
   address requesting the URL.
1. The server responds to that request by sending some content over
   the TCP connection.
   If the resource uses SSL, then [TLS negotation(s)][wikipedia-tls-handshake]
   happen as well.

When a redirect happens, `3.` contains the new URL the browser needs to
request, so the whole sequence is repeated. DNS Lookup isn’t cheap,
neither is [creating a TCP connection][tcp-connection-diagram]. The
impact of redirects is even more on mobile users, where the [network
latency is usually higher][pagespeed-insights].
As a rule of thumb, the more you can avoid redirects the better.

## What does the rule check?

This rule checks:

* If the target URL passed to `sonarwhal` has any redirect. E.g.:
  `http://www.example.com` --> `http://example.com`
* If any resource in the page has any redirect. E.g.:
  `http://example.com/script.js` --> `https://example.com/script.js`

and alerts if at least one is found.

### Examples that **trigger** the rule

* Any URL passed to `sonarwhal` that redirects to another one
* Any page with a resource (script, css, image) behind a redirect

### Examples that **pass** the rule

* No redirect for resources nor the target URL.

## Can the rule be configured?

By default no redirects are allowed but you can change this behavior.

The following configuration will allow 3 redirects for resources and
1 for the main URL:

```json
{
    "no-http-redirects": ["error", {
        "max-resource-redirects": 3,
        "max-html-redirects": 1
    }]
}
```

## Further Reading

* [Mobile Analysis in PageSpeed Insights][pagespeed-insights]
* [50 performance tricks to make your HTML5 apps and sites faster][50-tricks]
  (skip to 19:35)
* [Domain Names - Implementation and Specification][rfc1035]
* [How DNS Works][how-dns-works]
* [Redirections in HTTP][MDN-Redirections]
* [Transmision Control Protocol][wikipedia-tcp]

[50-tricks]: https://channel9.msdn.com/events/Build/2012/3-132#time=19m35s
[how-dns-works]: https://www.verisign.com/en_US/website-presence/online/how-dns-works/index.xhtml
[MDN-Redirections]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections
[pagespeed-insights]: https://developers.google.com/speed/docs/insights/mobile#adapting-to-high-latency-mobile-networks
[rfc1035]: https://tools.ietf.org/html/rfc1035
[tcp-connection-diagram]: https://www.eventhelix.com/RealtimeMantra/Networking/tcp/#.WgOQBkxFy2c
[wikipedia-tcp-establishment]: https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Connection_establishment
[wikipedia-tcp]: https://en.wikipedia.org/wiki/Transmission_Control_Protocol
[wikipedia-tls-handshake]: https://en.wikipedia.org/wiki/Transport_Layer_Security#TLS_handshake
