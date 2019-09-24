# External links disown opener (`disown-opener`)

`disown-opener` checks if the `rel` attribute is specified with both
the `noopener` and `noreferrer` values (or only `noopener` if all the
[targeted browsers][browser configuration] support it) on
`a` and `area` elements that have `target="_blank"` and link to other
origins.

## Why is this important?

Links that have `target="_blank"`, such as
`<a href="https://example.com" target="_blank">` constitute:

* [a security problem][security problem]

  When using `target="_blank"`, the page that was linked to gains
  access to the original page’s [`window.opener`][window.opener].
  This allows it to redirect the original page to whatever it wants,
  a technique frequently used for malicious attacks on the user.
  For example, the user could be redirected to a phishing page
  designed to look like the expected page and then asking for login
  credentials (see also: [tab nabbing][tab nabbing]).

  By adding `rel="noopener"` (and `noreferrer` for older browsers)
  the `window.opener` reference won’t be set, removing the ability
  for the page that was linked to from redirecting the original one.

* [a performance problem][performance problem]

  Most modern browsers are multi-process. However, in most browsers,
  due to the synchronous cross-window access the DOM allows via
  `window.opener`, pages launched via `target="_blank"` end up in
  the same process as the origin page, and that can lead to the pages
  experiencing jank.

  In Chromium based browsers, using `rel="noopener"` (or
  [`rel="noreferrer"`][noreferrer chromium] for older versions),
  and thus, preventing the `window.opener` reference from being set,
  allows new pages to be opened in their own process.

  Edge is not affected by this.

Notes:

* Not all browsers [support][noopener support] `rel="noopener"`,
  so to ensure that things work as expected in as many
  browsers as possible, by default, the hint requires both the
  `noopener` and `noreferrer` values to be specified. However,
  if all the [targeted browsers][browser configuration]
  support `noopener`, only `noopener` will be required.

* The reason why the hint does not check the same origin links by
  default is because:

  * Security isn’t really a problem here.
  * When it comes to performance, making same origin links open in
    their own process works against optimizations that some
    browsers do to keep multiple same origin tabs within
    the same process (e.g. share the same event loop).

  Check [`Can the hint be configured?`](#can-the-hint-be-configured)
  section to see how the hint can be made to also check same origin
  links.

* [`noopener` and `noreferrer` only work for `a` and `area`
  elements][html5sec].

* In the future there may be a [CSP valueless property][csp valueless
  property] that will prevent the `window.opener` reference
  from being set.

## What does the hint check?

By default, the hint checks if the `rel` attribute was specified with
both the `noopener` and `noreferrer` values on `a` and `area` elements
that have `target="_blank"` and link to other origins.

If the [targeted browsers are specified](#can-the-hint-be-configured),
based on their support, the hint might only require the `noopener`
value.

Let’s presume the original page is `https://example1.com`.

### Examples that **trigger** the hint

```html
<a href="http://example1.com/example.html" target="_blank">example</a>
```

```html
<a href="https://en.example1.com" target="_blank">example</a>
```

```html
<a href="//example2.com" target="_blank">example</a>
```

```html
<a href="https://example2.com" target="_blank">example</a>
```

```html
<img src="example.png" width="10" height="10" usemap="#example">
<map name="example">
    <area shape="rect" coords="0,0,5,5" href="http://example3.com/example.html" target="_blank">
</map>
```

### Examples that **pass** the hint

```html
<a href="/" target="_blank">example</a>
```

```html
<a href="example.html" target="_blank">example</a>
```

```html
<a href="https://example1.com/example.html" target="_blank">example</a>
```

```html
<a href="http://example1.com/example.html" target="_blank" rel="noopener noreferrer">example</a>
```

```html
<a href="https://en.example1.com/example.html" target="_blank" rel="noopener noreferrer">example</a>
```

```html
<a href="//example2.com" target="_blank" rel="noopener noreferrer">example</a>
```

```html
<a href="https://example2.com" target="_blank" rel="noopener noreferrer">example</a>
```

```html
<img src="example.png" width="10" height="10" usemap="#example">
<map name="example">
    <area shape="rect" coords="0,0,5,5" href="example.html" target="_blank">
</map>
```

```html
<img src="example.png" width="10" height="10" usemap="#example">
<map name="example">
    <area shape="rect" coords="0,0,5,5" href="http://example3.com/example.html" target="_blank" rel="noopener noreferrer">
</map>
```

## Can the hint be configured?

`includeSameOriginURLs` can be used to specify that same origin URLs
should also include `rel="noopener noreferrer"`.

In the [`.hintrc`][hintrc] file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "disown-opener": ["error", {
            "includeSameOriginURLs": true
        }],
        ...
    },
    ...
}
```

Also, note that this hint takes into consideration the [targeted
browsers][browser configuration], and if all of them
support the `noopener` value, the hint won’t require the `noreferrer`
value.

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
        "disown-opener": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [The security benefits of `rel="noopener"`][security problem]
* [The performance benefits of `rel="noopener"`][performance problem]
* [Bypassing `window.opener` protection of `rel="noreferrer"`][html5sec]
* [Link type `"noopener"`](https://html.spec.whatwg.org/#link-type-noopener)
* [Link type `"noreferrer"`](https://html.spec.whatwg.org/#link-type-noreferrer)

<!-- Link labels: -->

[csp valueless property]: https://github.com/w3c/webappsec/issues/139
[html5sec]: https://html5sec.org/#143
[noopener support]: http://caniuse.com/#feat=rel-noopener
[noreferrer chromium]: https://blog.chromium.org/2009/12/links-that-open-in-new-processes.html
[performance problem]: https://jakearchibald.com/2016/performance-benefits-of-rel-noopener/
[security problem]: https://mathiasbynens.github.io/rel-noopener/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[tab nabbing]: http://www.azarask.in/blog/post/a-new-type-of-phishing-attack/
[window.opener]: https://developer.mozilla.org/en-US/docs/Web/API/Window/opener
[browser configuration]: https://webhint.io/docs/user-guide/configuring-webhint/browser-context/
