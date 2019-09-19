# Manifest has scoped `start_url` (`manifest-scoped-urls`)

`manifest-scoped-urls` requires that:

* The start_url is accessible and scoped.

## Why is this important?

From [Google Lighthouse Audit][start_url_imp]

> After your web app has been added to a user's homescreen, the start_url property
> in the Web App Manifest determines what page of your app loads first
> when the user launches your app from the homescreen.
>
> If the start_url property is absent, then the browser defaults to whatever
> page was active when the user decided to add the app to the homescreen.

The `scope` in the Web Manifest file is important to decide whether the user
has left the app or not. Also, the `start_url` needs to be same-origin
as specified in the W3C Specs for [start_url][w3c-start_url].

From [Google Lighthouse Audit][scope_imp]

> The scope defines the set of URLs that the browser considers to be
> within your app, and is used to decide when the user has left the app.
> The scope controls the URL structure that encompasses all the entry
> and exit points in your web app.

## What does the hint check?

`manifest-scoped-urls` checks that the:

2. `start_url` is specified.
3. `start_url` is same-origin.
4. `start_url` is accessible.
5. `start_url` path is **equal to** or **child of** path specified
in `scope` (_default_ scope is `/` ).

### Examples that **trigger** the hint

A list of code examples that will fail this hint.

#### Example 1

No `start_url` property specified in Manifest file.

```json
{
    ...,
    "short_name": "Test webhint App"
    ...
}
```

#### Example 2

Manifest property start_url not scoped.

```json
{
    ...,
    "start_url": "/",
    "scope": "/test"
    ...
}
```

#### Example 3

Manifest property start_url scoped but inaccessible.

```json
{
    ...,
    "start_url": "/test",
    "scope": "/test"
    ...
}
```

#### Example 4

Manifest property start_url is not same origin.

```json
{
    ...,
    "start_url": "https://example.com",
    "scope": "/",
    ...
}
```

### Examples that **pass** the hint

```json
{
    ...,
    "start_url": "/index.html",
    "scope": "/"
    ...
}
```

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
    "parsers": [...],
    "hints": {
        "manifest-scoped-urls": "error"
    },
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

See [W3C Web App Manifest Spec.][w3c-spec] for icons to get more information.

<!-- Link labels: -->

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[start_url_imp]: https://developers.google.com/web/tools/lighthouse/audits/manifest-contains-start_url
[w3c-spec]: https://www.w3.org/TR/appmanifest/
[w3c-start_url]: https://w3c.github.io/manifest/#start_url-member
[scope_imp]: https://developers.google.com/web/fundamentals/web-app-manifest/
