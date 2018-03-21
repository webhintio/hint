# SSL Server Test (`@sonarwhal/rule-ssllabs`)

`ssllabs` deeply analyzes the SSL configuration of a web server using
[SSL Labs’ SSL Server Test][ssllabs].

## Why is this important?

> SSL/TLS is a deceptively simple technology. It is easy to deploy,
and it just works--except when it does not. The main problem is that
encryption is not often easy to deploy correctly. To ensure that TLS
provides the necessary security, system administrators and developers
must put extra effort into properly configuring their servers and
developing their applications.

***From [SSL Labs’ SSL and TLS Deployment Best Practices][ssl best
practices]***

## What does the rule check?

This rule uses the [SSL Labs API][ssllabs api] via
[`node-ssllabs`][node-ssllabs] to analyze the SSL configuration of
a server and report a grade.

Please look at [SSL Labs’ Methodology Overview][ssllabs methodology]
if you want to know more about the process.

Notes:

* Only servers on the public internet can be scanned by SSL Labs.
  Internal domains will fail.
* SSL Labs might have decided not to allow scanning of a domain
  (if, for example, the owner has requested it).

## Can the rule be configured?

By default the minimum grade is `A-` but you can configure it to
any valid [grade reported by SSL Labs][ssllabs server rating guide]
by setting the `grade` option for the `ssllabs` rule in the
[`.sonarwhalrc`][sonarwhalrc] file.

E.g. The following configuration will change the minium grade to `A+`:

```json
{
    "connector": {...},
    "formatters": [...],
    "rules": {
        "ssllabs": [ "error", {
            "grade": "A+"
        }],
        ...
    },
    ...
}
```

SSL Labs’ scanner also allows some configuration. By default the one
used is:

```json
{
    "all": "done",
    "fromCache": true,
    "maxAge": 2
}
```

You can override the defaults with the following configuration:

```json
{
    "connector": {...},
    "formatters": [...],
    "rules": {
        "ssllabs": [ "error", {
            "ssllabs": {
                "fromCache": false,
                ...
            }
        }],
        ...
    },
    ...
}
```

The list of possible parameters is available in [SSL Labs’
documentation][ssllabs protocol calls] with the difference
that `on/off` parameters are `boolean`s in our case as shown
in [`node-ssllabs`’ advanced usage][node-ssllabs usage].

## Further Reading

* [SSL and TLS Deployment Best Practices][ssl best practices]
* [SSL Pulse](https://www.trustworthyinternet.org/ssl-pulse/)
* [SSL Labs Research wiki](https://github.com/ssllabs/research/wiki)

<!-- Link labels: -->

[node-ssllabs usage]: https://github.com/keithws/node-ssllabs#advanced-usage
[node-ssllabs]: https://github.com/keithws/node-ssllabs
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
[ssl best practices]: https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices
[ssllabs api]: https://www.ssllabs.com/projects/ssllabs-apis/
[ssllabs methodology]: https://github.com/ssllabs/research/wiki/SSL-Server-Rating-Guide#methodology-overview
[ssllabs protocol calls]: https://github.com/ssllabs/ssllabs-scan/blob/stable/ssllabs-api-docs.md#protocol-calls
[ssllabs server rating guide]: https://github.com/ssllabs/research/wiki/SSL-Server-Rating-Guide
[ssllabs]: https://www.ssllabs.com/ssltest/index.html
