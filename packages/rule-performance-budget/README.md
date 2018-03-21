# Performance budget (`@sonarwhal/rule-performance-budget`)

> A web performance budget is a group of limits to certain values that affect
> site performance that should not be exceeded in the design and development of
> any web project. This could be the total size of a page, size of images you
> are uploading, or even the number of HTTP requests that your webpage
> generates.

[keycdn - web performance budget][keycdn-wpb]

## Why is this important?

As of January 2018, the average size of a website is 3,545kB:

![image][average site size]

Although the global average connection is 7.2Mb/s (check [_Akamai's state of
the Internet 2017_][state of the internet]), _"no bit is faster than one that is
not sent"_ (quote by [Ilya Grigorik][faster bit]). Web developers need to be
mindful not only about the size of their sites, but also the number of
requests, different domains, third party scripts, etc. The time required by a
browser to download a 200kB file is not the same than 20 files of 10kB.

## What does the rule check?

This rule calculates how long it will take to download all the resources loaded
initially by the website under a `3G Fast` network (but that can be changed,
see ["Can the rule be configured?"][can be configured] section). If the load
time is **greater than 5 seconds**, the rule will fail.

To calculate the final load time, some assumptions and simplifications are
done. While the real numbers might be different, the results should provide
enough guidance to know if something needs more attention.

The reason for using predefined conditions and assumptions are:

* Guarantee consistent results accross runs. If a website serves the same
  assets, the results should be the same.
* Show the impact in load time of each transmitted byte with the goal of
  reducing the number and size of resources downloaded (first and third party).

The simplified formula to calculate the time is:

```text
Time = (total number of requests * RTT) +
       (number of different domains * RTT) +
       (number of different secured domains * RTT) +
       (number of redirects * RTT) +
       (total number of requests * TCP slow-start phase) +
       (total size of resources / bandwidth)
```

This is the list of things taken into account:

* Everything is a first load, no values are cached, and no connections are
  opened.
* [`RTT` (Round-Trip Time)][rtt] is fixed and changes depending on the
  configured network. It assumes all servers respond instantly and in the same
  amount of time.
* [`DNS lookup`][dns lookup]: Every hostname resolution requires 1 RTT,
  imposing latency on the request and blocking the request while the lookup is
  in progress.
* [`TCP handshake`][three-way handshake]: Each request requires a new TCP
  connection. TCP connections require 1 RTT before start sending information to
  the server. There's no connection reuse and the maximum number of connections
  to a domain (usually 6) is ignored.
* [`TCP slow-start phase`][slow-start phase]: The values used to calculate the
  duration are:
  * `cwnd`: 10 network segments
  * `rwnd`: 65,535 bytes (no `TCP window scaling`)
  * `segment size`: 1460 bytes
  After this phase, the full bandwidth of the connection is used to download
  the remaining.
* [`TLS handshake`][tls handshake]: New TLS connections usually require two
  roundtrips for a "full handshake". However, there are ways of requiring only
  1 RTT like [`TLS False Start`][tls false start] and [`TLS Session
  Resumption`][tls session resumption]. This rule assumes the optimistic
  scenario.
* Redirects: We simplify the redirects and assume the connection is reused and
  to the same server. If the redirect is to another domain, the penalty will be
  even greater.
* The server doesn't use [`HTTP2`][http2].

## Can the rule be configured?

You can change the type of connection and/or the target load time
in the [`.sonarwhalrc`][sonarwhalrc] file, using something such as
the following:

```json
{
    "connector": {...},
    "formatters": [...],
    "rules": {
        "performance-budget": ["error", {
            "connectionType": "Dial",
            "loadTime": 10
        }],
        ...
    },
    ...
}
```

The possible values and the associated speeds for `connectionType` are:

| Value  |       In |      Out |   RTT |
| -------|----------|----------|-------|
| FIOS   |  20 Mbps |   5 Mbps |   4ms |
| LTE    |  12 Mbps |  12 Mbps |  70ms |
| 4G     |   9 Mbps |   9 Mbps | 170ms |
| Cable  |   5 Mbps |   1 Mbps |  28ms |
| 3G     | 1.6 Mbps | 768 Kbps | 300ms |
| 3GFast | 1.6 Mbps | 768 Kbps | 150ms |
| DSL    | 1.5 Mbps | 384 Kbps |  50ms |
| 3GSlow | 400 Kbps | 400 Kbps | 400ms |
| 3G_EM  | 400 Kbps | 400 Kbps | 400ms |
| 2G     | 280 Kbps | 256 Kbps | 800ms |
| Edge   | 240 Kbps | 200 Kbps | 840ms |
| Dial   |  49 Kbps |  30 Kbps | 120ms |

`loadTime` has to be a number greater than `1` and indicates the time in
seconds to load all the resources.

The default values are:

* `connectionType`: `3GFast`
* `loadTime`: `5`

This means that if the user changes the `connectionType` but not the
`loadTime`, the rule will use `5` as the target.

### Examples that **trigger** the rule

* Any combination of sizes, redirects, requests to different domains, etc. that
  make the site load after 5s on a `3GFast` network using the established
  formula.

### Examples that **pass** the rule

* Any combination of sizes, redirects, requests to different domains, etc. that
  make the site load in or under 5s on a `3GFast` network using the established
  formula.

## Further Reading

* [High Performance Browser Networking][hbpn]
* [Can You Afford It?: Real-world Web Performance Budgets][can you afford it]
* [Setting and Calculating a Web Performance Budget][keycdn-wpb]
* [The Cost Of JavaScript][cost of javascript]

<!-- Link labels -->

[average site size]: https://chart.googleapis.com/chart?chs=400x225&cht=p&chco=007099&chd=t:1818,70,98,504,120,851,27&chds=0,1818&chdlp=b&chdl=total%203545%20kB&chl=Images+-+1818+kB%7CHTML+-+70+kB%7CStylesheets+-+98+kB%7CScripts+-+504+kB%7CFonts+-+120+kB%7CVideo+-+851+kB%7COther+-+27+kB&chma=|5&chtt=Average+Bytes+per+Page+by+Content+Type
[can be configured]: #can-the-rule-be-configured
[can you afford it]: https://infrequently.org/2017/10/can-you-afford-it-real-world-web-performance-budgets/
[cost of javascript]: https://medium.com/dev-channel/the-cost-of-javascript-84009f51e99e
[dns lookup]: https://www.cloudflare.com/learning/dns/what-is-dns/
[faster bit]: https://hpbn.co/building-blocks-of-tcp/#tuning-application-behavior
[hbpn]: https://hpbn.co/
[http2]: https://hpbn.co/http2/
[keycdn-wpb]: https://www.keycdn.com/blog/web-performance-budget/
[rtt]: https://hpbn.co/primer-on-latency-and-bandwidth/#speed-of-light-and-propagation-latency
[slow-start phase]: https://hpbn.co/building-blocks-of-tcp/#slow-start
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
[state of the internet]: https://www.akamai.com/us/en/multimedia/documents/state-of-the-internet/q1-2017-state-of-the-internet-connectivity-report.pdf
[tcp handshake]: https://hpbn.co/building-blocks-of-tcp/#three-way-handshake
[three-way handshake]: https://hpbn.co/building-blocks-of-tcp/#three-way-handshake
[tls false start]: https://hpbn.co/transport-layer-security-tls/#enable-tls-false-start
[tls handshake]: https://hpbn.co/transport-layer-security-tls/#tls-handshake
[tls session resumption]: https://hpbn.co/transport-layer-security-tls/#tls-session-resumption
