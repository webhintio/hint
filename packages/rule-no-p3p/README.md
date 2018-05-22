# Disallow P3P headers (`@sonarwhal/rule-no-p3p`)

`no-p3p` disallows the use of "P3P" headers in server responses.

## Why is this important?

[P3P](https://www.w3.org/TR/P3P11/) -- Platform for Privacy Preferences Project
-- is an outdated technology
that is meant to allow browsers to programmatically check privacy policies.

It has had most traction in Microsoft&trade;'s Internet Explorer and Edge, but
those browsers also dropped support for it in 2018. For more information on
browser-support, view the [Wiki page on P3P](https://en.wikipedia.org/wiki/P3P#User_agent_support)

In case it's not kept in sync with normal human-readable privacy policies, it
may be a cause of legal confusion, which might open up legal risks. Please check
with a local lawyer to see if that's the case. To prevent this from happening,
it's suggested to not use P3P anymore.

## What does the rule check?

It disallows the use of the "P3P" header in server responses.

### Examples that **trigger** the rule

Note: the following examples are case-insensitive.

The `P3P` header is sent:

```text
HTTP/... 200 OK

...
p3p: CP="NON DSP COR CURa PSA PSD OUR BUS NAV STA"
...
```

The `P3P` header is sent with non-P3P contents:

```text
HTTP/... 200 OK

...
p3p: Random or empty value
...
```

### Examples that **pass** the rule

The `P3P` header is not sent:

```text
HTTP/... 200 OK
date: Wed, 16 May 1971 16:21:53 GMT
server: Apache
cache-control: max-age=300
vary: User-Agent
content-type: text/html; charset=UTF-8
...
```
