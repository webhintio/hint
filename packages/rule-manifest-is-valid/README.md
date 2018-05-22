# Require valid manifest (`@sonarwhal/rule-manifest-is-valid`)

`manifest-is-valid` checks if the content of the web app manifest file
is valid JSON, valid acording to the specification, and the property
values work in all [targeted browsers][targeted browsers].

## Why is this important?

Web app manifest files that don't contain valid JSON are ignored by
user agents. The same goes for invalid property values or non-standard
properties.

Also, providing property values that are only supported by certain
user agents for which the [specification][manifest spec] does not define
a fallback, can lead to interoperability issues.

## What does the rule check?

`manifest-is-valid` checks if:

* The content of the web app manifest file is valid JSON, and valid
  acording to the specification, namely:

  * No additional properties are specified.
  * All property values are of the type specified by the specification.

* The property values work in all [targeted browsers][targeted browsers].

### Examples that **trigger** the rule

The web app manifest file contains invalid JSON:

```json
{
    "name": "invalid
}
```

The web app manifest file contains additional non-standard properties

```json
{
    "additional_non-standard_property": "invalid",
    "name": "example name",
    ...
}
```

or [deprecated properties][density issue]:

```json
{
    "icons": [{
        "density: 2",
        ...
    }],
    ...
}
```

Web app manifest file contains property values of a type different
then what is specified by the specification, e.g. `name` is a `number`
instead of a `string`:

```json
{
    "name": 5,
    ...
}
```

The web app manifest file contains properties with invalid values:

```json
{
    "lang": "en-x",
    ...
}
```

```json
{
    "theme_color": "invalid",
    ...
}
```

The web app manifest file contains a properties with values not
supported everywhere:

```json
{
    "theme_color": "#ff0000aa",
    ...
}
```

### Examples that **pass** the rule

The content of the web app manifest file is valid JSON, valid
according to the specification, and the property values work in
[targeted browsers][targeted browsers]:

```json
{
  "background_color": "red",
  "description": "Example of a progressive web app",
  "icons": [{
      "src": "icon.png",
      "sizes": "512x512",
      "type": "image/png"
  }],
  "name": "Example progressive web app",
  "short_name": "Example",
  "start_url": "index.html",
  "theme_color": "red"
}
```

## How to use this rule?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-manifest-is-valid
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.sonarwhalrc`][sonarwhalrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": [...],
    "rules": {
        "manifest-is-valid": "error"
    },
    ...
}
```

## Further Reading

* [Web App Manifest specification][manifest spec]

<!-- Link labels: -->

[density issue]: https://github.com/w3c/manifest/issues/450
[manifest spec]: https://w3c.github.io/manifest/
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
[targeted browsers]: https://sonarwhal.com/docs/user-guide/further-configuration/browser-context/
