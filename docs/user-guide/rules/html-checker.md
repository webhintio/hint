# The Nu HTML Test (`html-checker`)

`html-checker` validates the markup of a website against the [Nu HTML checker](https://validator.github.io/validator/).

## Why is this important?

> Serving valid HTML nowadays have been commonly overlooked these days.
By running the HTML documents through a checker, it's easier to catch
unintended mistakes which might have otherwise been missed.
Adhering to the W3C' standards has a lot to offer to both the
developers and the web users: It provides better browser compatibility,
helps to avoid potential problems with accessibility/usability, and makes it easier for future maintainance.
>
> The Nu Html Checker(v.Nu) serves as the backend of [checker.html5.org](https://checker.html5.org/),
[html5.validator.nu](https://html5.validator.nu), and [validator.w3.org/nu](https://validator.w3.org/nu/).
It also provides a [web service interface](https://github.com/validator/validator/wiki/Service-%C2%BB-HTTP-interface).
This rule interacts with this service via [html-validator](https://www.npmjs.com/package/html-validator),
and is able to test both remote websites and local server instances.

## What does the rule check?

According to the Nu Html checker [documentation](https://validator.w3.org/nu/about.html), the positive cases contain two sections:

* Markup cases that are potential problems for accessibility, usability,
  interoperability, security, or maintainability—or because they can result in poor performance,
  or that might cause your scripts to fail in ways that are hard to troubleshoot.

* Markup cases that are defined as errors because they can cause you to run into potential
  problems in HTML parsing and error-handling behavior—so that, say, you’d end up with some unintuitive, unexpected result in the DOM.

For explanation behind those requirements, please checkout:

* [rationale for syntax-level errors](https://www.w3.org/TR/html/introduction.html#syntax-errors)
* [rationale for restrictions on content models and on attribute values](https://www.w3.org/TR/html/introduction.html#restrictions-on-content-models-and-on-attribute-values)

## Can the rule be configured?

You can ignore certain error/warning by setting the `ignore` option for the `html-checker` rule.
You can either pass in a string or an array that contains all the messages to be ignored.

E.g. The following configuration will ignore the errors/warnings with the message of `Invalid attribute`:

```json
"html-checker": ["error", {
    "ignore": "Invalid attribute"
}]
```

Alternative, you can pass in an array if you have more than one type of messages to ignore:

```json
"html-checker": ["error", {
    "ignore": ["Invalid attribute", "Invalid tag"]
}]
```

You can also override the default validator by passing in the endpoint of an alternative validator. However, you need to make sure that this alternative validator exposes the same REST interface as the default one.

```json
"html-checker": ["error", {
    "validator": "https://html5.validator.nu"
}]
```

## Further Reading

* [Why Validate Using the Nu Html Checker?](https://validator.w3.org/nu/about.html)
* [The Nu Html Checker Wiki](https://github.com/validator/validator/wiki)
