# Require manifest to specify the web site/app name (`@sonarwhal/rule-manifest-app-name`)

`manifest-app-name` warns against not specifying the web site/app’s
name.

## Why is this important?

Browsers that have support for the [web app manifest file][manifest
spec] will use [`name`][manifest name] member (or the
[`short_name`][manifest short_name], when there is insufficient space)
to display the name of the site/app in situations such as: amongst
a list of other applications, as a label for an icon, etc.

If these members are not defined, browsers will try to get the name
from other sources such as the value of the [`application-name` meta
tag, `<title>`, or just default to a specific value (e.g.:
`Untitled`)][manifest metadata]. This can lead to bad user experience,
as the web site/app name may be truncated or just wrong.

In general it is recommended to specify and have the `name` member
under 30 character, and if it’s over 12 characters also have a
`short_name` member that is at most 12 characters.

Notes:

* If the `name` is under or 12 characters, there isn’t a need to
  specify `short_name` as browsers can just use `name`.

* The 12 character limit is used to ensure that for most cases the
  value won’t be truncated. However depending on [other things][sonarwhal
  issue], such as:

  * what font the user is using
  * what characters the web site/app name includes (e.g. `i` occupies
    less space then `W`)

  the text may still be truncated even if it’s under 12 characters.

* The 30 character limit is used in order to be consistent with the
  native OSes/[app stores][app store] limits/recommendations.

## How to use this rule?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-manifest-app-name
```

You can make `npm` install it as a `devDependency` using the `--save-dev`
parameter, or to install it globally, you can use the `-g` parameter. For
other options see the
[`npm`'s documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.sonarwhalrc`][sonarwhalrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": [...],
    "rules": {
        "manifest-app-name": "error"
    },
    ...
}
```

## What does the rule check?

The rule checks if a non-empty `name` member was specified and it’s
value is under 30 characters.

If the `name` member is over 12 characters, or `short_name` is
specified, the rule will also check if `short_name` has a non-empty
value that is under 12 characters.

### Examples that **trigger** the rule

Manifest is specified without `name` and `short_name`:

```json
{
    ...
}
```

Manifest is specified with a `name` longer than 12 characters
and no `short_name`:

```json
{
    "name": "Baldwin Museum of Science",
    ...
}
```

Manifest is specified with a `name` longer than 30 characters:

```json
{
    "name": "Baldwin Museum of Science - visit today!",
    "short_name": "Baldwin"
    ...
}
```

Manifest is specified with `short_name` longer than 12 characters:

```json
{
    "name": "Baldwin Museum of Science",
    "short_name": "Baldwin Museum"
    ...
}
```

### Examples that **pass** the rule

Manifest is specified with a `name` shorter than 30 characters
and a `short_name` shorter than 12 characters:

```json
{
    "name": "Baldwin Museum of Science",
    "short_name": "Baldwin"
    ...
}
```

Note: [Not specifying a manifest file](manifest-exists.md), or having
an invalid one are covered by other rules, so those cases won’t make
this rule fail.

## Further Reading

* [Web App Manifest specification][manifest spec]

<!-- Link labels: -->

[app store]: https://developer.apple.com/app-store/product-page/
[manifest metadata]: https://w3c.github.io/manifest/#authority-of-the-manifest%27s-metadata
[manifest name]: https://w3c.github.io/manifest/#name-member
[manifest short_name]: https://w3c.github.io/manifest/#short_name-member
[manifest spec]: https://w3c.github.io/manifest/
[sonarwhal issue]: https://github.com/sonarwhal/sonarwhal/issues/136
