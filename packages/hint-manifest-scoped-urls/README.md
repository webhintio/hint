# manifest-scoped-urls (`@hint/hint-manifest-scoped-urls`)

`manifest-scoped-urls` requires that:

* The start_url is accessible and scoped.
* Either `name` or `short_name` is specified

## Why is this important?

From [Google Lighthouse Audit][start_url_imp]

> After your web app has been added to a user's homescreen, the start_url property
> in the Web App Manifest determines what page of your app loads first
> when the user launches your app from the homescreen.
>
> If the start_url property is absent, then the browser defaults to whatever
> page was active when the user decided to add the app to the homescreen.

The `scope` in the Web Manifest file is important to decide whether the user
has left the app or not.

From [Google Lighthouse Audit][scope_imp]

> The scope defines the set of URLs that the browser considers to be
> within your app, and is used to decide when the user has left the app.
> The scope controls the URL structure that encompasses all the entry
> and exit points in your web app.

## What does the hint check?

`manifest-scoped-urls` checks that the:

1. `name` or `short_name` is specified.
2. `start_url` is specified.
3. `start_url` is accessible.
4. `start_url` path is **equal to** or **child of** path specified
in `scope` (_default_ scope is `/` ).

### Examples that **trigger** the hint

A list of code examples that will fail this hint.

#### Example 1

No `name` or `short_name` property specified in Manifest file

```json
{
    ...,
    "start_url": "/",
    ...
}
```

#### Example 2

No `start_url` property specified in Manifest file

`http://localhost:5000/an-inaccessible-path.png`

```json
{
    ...,
    "short_name": "Test webhint App"
    ...
}
```

#### Example 3

Manifest property start_url not scoped.

`http://localhost:5000/an-inaccessible-path.png`

```json
{
    ...,
    "short_name": "Test webhint App",
    "start_url": "/",
    "scope": "/test"
    ...
}
```

#### Example 4

Manifest property start_url scoped but inaccessible

`http://localhost:5000/an-inaccessible-path.png`

```json
{
    ...,
    "short_name": "Test webhint App",
    "start_url": "/test",
    "scope": "/test"
    ...
}
```

### Examples that **pass** the hint

```json
{
    ...,
    "short_name": "Test webhint App",
    "start_url": "/index.html",
    "scope": "/"
    ...
}
```

## How to use this hint?

To use it you will have to install it via `npm`:

```bash
npm install @hint/hint-manifest-scoped-urls
```

Note: You can make `npm` install it as a `devDependency` using the `--save-dev`
parameter, or to install it globally, you can use the `-g` parameter. For
other options see
[`npm`'s documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.hintrc`][hintrc]
configuration file:

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

## Further Reading

<!-- Link labels: -->
See [W3C Web App Manifest Spec.][w3c-spec] for icons to get more information.

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[start_url_imp]: https://developers.google.com/web/tools/lighthouse/audits/manifest-contains-start_url
[w3c-spec]: https://www.w3.org/TR/appmanifest/
[scope_imp]: https://developers.google.com/web/fundamentals/web-app-manifest/
