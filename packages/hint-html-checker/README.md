# Nu HTML test (`html-checker`)

`html-checker` validates the markup of a website against the
[Nu HTML checker][nu html checker].

## Why is this important?

> Serving valid HTML nowadays have been commonly overlooked these days.
> By running the HTML documents through a checker, it’s easier to catch
> unintended mistakes which might have otherwise been missed.
> Adhering to the W3C’s standards has a lot to offer to both the
> developers and the web users: It provides better browser compatibility,
> helps to avoid potential problems with accessibility/usability,
> and makes it easier for future maintenance.
>
> The Nu Html Checker(v.Nu) serves as the backend of
> [html5.validator.nu][html5 validator], and
> [validator.w3.org/nu][w3 validator].
> It also provides a [web service interface][validator interface].

This hint interacts with this service via [`request`][request]
and can test both remote websites and local server instances.

## What does the hint check?

According to the Nu Html checker [documentation][nu html checker docs],
the positive cases contain two sections:

* Markup cases that are potential problems for accessibility,
  usability, compatibility, security, or maintainability—or because
  they can result in poor performance, or that might cause your scripts
  to fail in ways that are hard to troubleshoot.

* Markup cases that are defined as errors because they can cause you
  to run into potential problems in HTML parsing and error-handling
  behavior—so that, say, you’d end up with some unintuitive, unexpected
  result in the DOM.

For explanation behind those requirements, please check out:

* [rationale for syntax-level errors](https://www.w3.org/TR/html/introduction.html#syntax-errors)
* [rationale for restrictions on content models and on attribute values](https://www.w3.org/TR/html/introduction.html#restrictions-on-content-models-and-on-attribute-values)

## Can the hint be configured?

By default, only the first occurrence of each error/warning is reported
when validating the markup. However, you can configure the hint to view
the complete list.

The following hint configuration in the [`.hintrc`][hintrc]
file will enable the full-list view of errors/warnings reported by the
HTML checker:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "html-checker": ["error", {
            "details": true
        }],
        ...
    },
    ...
}
```

You can ignore certain error/warning by setting the `ignore` option
for the `html-checker` hint. You can either pass in a string or an
array that contains all the messages to be ignored.

E.g. The following configuration will ignore the errors/warnings with
the message of `Invalid attribute`:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "html-checker": ["error", {
            "ignore": "Invalid attribute"
        }],
        ...
    },
    ...
}
```

Alternative, you can pass in an array if you have more than one type
of message to ignore:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "html-checker": ["error", {
            "ignore": ["Invalid attribute", "Invalid tag"]
        }],
        ...
    },
    ...
}
```

You can also override the default validator by passing in the endpoint
of an alternative validator. However, you need to make sure that this
alternative validator exposes the same REST interface as the default
one.

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "html-checker": ["error", {
            "validator": "https://html5.validator.nu"
        }],
        ...
    },
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
    "hints": {
        "html-checker": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [Why Validate Using the Nu Html Checker?][nu html checker docs]
* [The Nu Html Checker Wiki](https://github.com/validator/validator/wiki)

<!-- Link labels: -->

[request]: https://www.npmjs.com/package/request
[html5 validator]: https://html5.validator.nu
[nu html checker docs]: https://validator.w3.org/nu/about.html
[nu html checker]: https://validator.github.io/validator/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[validator interface]: https://github.com/validator/validator/wiki/Service-%C2%BB-HTTP-interface
[w3 validator]: https://validator.w3.org/nu/
