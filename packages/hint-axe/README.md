# axe accessibility check (`axe`)

`axe` is the accessibility engine for automated testing of HTML-based
user interfaces. These hints run the recommended set of WCAG 2.1
Level A and Level AA rules from [axe-core][axe core].

## Why is this important?

> The Web is an increasingly important resource in many aspects
of life: education, employment, government, commerce, health care,
recreation, and more. It is essential that the Web be accessible
in order to provide **equal access** and **equal opportunity** to
people with disabilities. An accessible Web can also help people
with disabilities more actively participate in society.
>
> The Web offers the possibility of **unprecedented access to
information and interaction** for many people with disabilities.
That is, the accessibility barriers to print, audio, and visual
media can be much more easily overcome through Web technologies.
>
> The document ["Social Factors in Developing a Web Accessibility
Business Case for Your Organization"][wai soc] discusses how the
Web impacts the lives of people with disabilities, the overlap with
digital divide issues, and Web accessibility as an aspect of corporate
social responsibility.
>
> Another important consideration for organizations is that web
accessibility is required by laws and policies in some cases.

***From [WAI’s Introduction to Web Accessibility][wai].***

## What does the hint check?

By default, `hint-axe` contains hints which run all the
[WCAG 2.1][wcag 2.1] Level A and Level AA rules included in
[axe-core][axe core] with `document` as the target. These rules are
grouped into hints based on their assigned category within `axe-core`.
See each contained hint for the specific list of enabled rules within
that group and more information about each rule.

## Hints

<!-- start hints -->
* [ARIA (axe/aria)][axe/aria]
* [Color (axe/color)][axe/color]
* [Forms (axe/forms)][axe/forms]
* [Keyboard (axe/keyboard)][axe/keyboard]
* [Language (axe/language)][axe/language]
* [Name Role Value (axe/name-role-value)][axe/name-role-value]
* [Parsing (axe/parsing)][axe/parsing]
* [Semantics (axe/semantics)][axe/semantics]
* [Sensory and Visual Cues (axe/sensory-and-visual-cues)][axe/sensory-and-visual-cues]
* [Structure (axe/structure)][axe/structure]
* [Tables (axe/tables)][axe/tables]
* [Text Alternatives (axe/text-alternatives)][axe/text-alternatives]
* [Time and Media (axe/time-and-media)][axe/time-and-media]
<!-- end hints -->

## Can the hint be configured?

This hint uses [`axe.run`][axe.run] and the default values ([WCAG
2.1][wcag 2.1] Level A and Level AA rules) over the `document`.
You can modify what rules or categories are executed via an `options`
object that follows [axe’s documentation][axe docs].

Some examples of hint configurations that you can have in the
[`.hintrc`][hintrc] file:

Disable a rule included in the default configuration:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "axe/language": ["error", {
            "html-has-lang": "off"
        }],
        ...
    },
    ...
}
```

Enable a rule excluded from the default configuration:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "axe/keyboard": ["error", [
            "tabindex"
        ]],
        ...
    },
    ...
}
```

or if you want to set a custom severity:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "axe/keyboard": ["error", {
            "tabindex": "error"
        }],
        ...
    },
    ...
}
```

Change the severity of an individual rule:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "axe/color": ["error", {
            "color-contrast": "warning"
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
        "axe/aria": "error",
        "axe/color": "error",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

## Further Reading

* [Deque University](https://dequeuniversity.com/)
* [axe core GitHub page][axe core]
* [Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/)

<!-- Link labels: -->

[axe core]: https://github.com/dequelabs/axe-core/
[axe docs]: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#options-parameter
[axe rules]: https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
[axe.run]: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#api-name-axerun
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[wai soc]: https://www.w3.org/WAI/bcase/soc
[wai]: https://www.w3.org/WAI/intro/accessibility.php
[wcag 2.1]: https://www.w3.org/TR/WCAG21/
<!-- start hint links -->
[axe/aria]: https://webhint.io/docs/user-guide/hints/hint-axe/aria/
[axe/color]: https://webhint.io/docs/user-guide/hints/hint-axe/color/
[axe/forms]: https://webhint.io/docs/user-guide/hints/hint-axe/forms/
[axe/keyboard]: https://webhint.io/docs/user-guide/hints/hint-axe/keyboard/
[axe/language]: https://webhint.io/docs/user-guide/hints/hint-axe/language/
[axe/name-role-value]: https://webhint.io/docs/user-guide/hints/hint-axe/name-role-value/
[axe/parsing]: https://webhint.io/docs/user-guide/hints/hint-axe/parsing/
[axe/semantics]: https://webhint.io/docs/user-guide/hints/hint-axe/semantics/
[axe/sensory-and-visual-cues]: https://webhint.io/docs/user-guide/hints/hint-axe/sensory-and-visual-cues/
[axe/structure]: https://webhint.io/docs/user-guide/hints/hint-axe/structure/
[axe/tables]: https://webhint.io/docs/user-guide/hints/hint-axe/tables/
[axe/text-alternatives]: https://webhint.io/docs/user-guide/hints/hint-axe/text-alternatives/
[axe/time-and-media]: https://webhint.io/docs/user-guide/hints/hint-axe/time-and-media/
<!-- end hint links -->
