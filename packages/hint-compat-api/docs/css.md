# Supported CSS features (`compat-api/css`)

## What does the hint check?

`compat-api/css` checks if the CSS features used are
supported in all [target browsers][browser-context].

## Why is this important?

New CSS features are being implemented all the time. It's tricky knowing
when a feature has become standard among all browsers, when it needs a prefix,
and when it is not supported. This hint will check if you are using features
that are not supported by your target browsers, taking into account prefixes
and feature detection via `@supports` blocks.

### Examples that **trigger** the hint

Support for the [box-flex][box-flex] property was never added to any version
of Internet Explorer. If Internet Explorer is being targeted, using the
`box-flex` property will trigger the hint.

```css
.example {
    box-flex: 1;
}
```

The `grid` value of the [display][display] property was added to Chrome 57
and up. Using `display: grid` while targeting Chrome prior to 57 will trigger
the hint.

```css
.example {
    display: grid;
}
```

Using an unsupported property inside an `@supports` block that was not part
of the `@supports` test will trigger the hint.

```css
@supports (display: flex) {
    .example {
        display: grid;
    }
}
```

### Examples that **pass** the hint

The [charset][charset] at-rule was added in Chrome 2. It will pass when
targeting Chrome 2 or higher.

```css
@charset "UTF-8";
```

The [border-radius][border-radius] property was added in IE 9. It will pass
when targeting IE 9 or higher.

```css
.example {
    border-radius: 10px;
}
```

Using an unsupported property inside an `@supports` block will pass if it was
part of the `@supports` test.

```css
@supports (display: grid) {
    .example {
        display: grid;
    }
}
```

Using a supported property inside an `@supports` block will pass even if that
property was not part of the `@supports` test.

```css
@supports (display: flex) {
    .example {
        color: black;
    }
}
```

## Can the hint be configured?

This hint throws errors for CSS features that are not supported in any of the
[target browsers][target-browsers] listed.

The target browsers can be defined in either the `.hintrc` or
`package.json` file.
This property follows the same convention as [browserslist][browserslist].

```json
{
    "browserslist": [
        "> 1%",
        "last 2 versions"
    ]
}
```

`ignore` can be used to specify a list of CSS features to be ignored. The
default value is:

```json
[
    "-moz-appearance: none",
    "-webkit-appearance: none",
    "appearance: none",
    "cursor",
    "zoom: 1"
]
```

In the `.hintrc` file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "compat-api/css": ["error", {
            "ignore": ["border-radius", "box-lines"],
        }],
        ...
    },
    ...
}
```

`enable` can be used to specify a list of CSS features to be checked even if
they are included in the ignore list. The default value is `[]`.

In the `.hintrc` file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "compat-api/css": ["error", {
            "enable": ["cursor"],
        }],
        ...
    },
    ...
}
```

## Limitations

CSS features not represented in MDN will pass to avoid false-positives.
These could result from data missing for a particular browser or because a
bogus rule, property, or value was used.

CSS selectors, including pseudo-elements such as `::placeholder`, are not
currently checked.

## Further Reading

* [CSS: Cascading Style Sheets (MDN)][docmdn]
* [Browser Compat Data (MDN)][browser-compat]

<!-- Link labels: -->

[docmdn]: https://developer.mozilla.org/en-US/docs/Web/CSS
[border-radius]: https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius
[box-flex]: https://developer.mozilla.org/en-US/docs/Web/CSS/box-flex
[browser-compat]: https://github.com/mdn/browser-compat-data
[browser-context]: https://webhint.io/docs/user-guide/configuring-webhint/browser-context/
[browserslist]: https://github.com/browserslist/browserslist#readme
[charset]: https://developer.mozilla.org/en-US/docs/Web/CSS/@charset
[display]: https://developer.mozilla.org/en-US/docs/Web/CSS/display
[target-browsers]: https://webhint.io/docs/user-guide/configuring-webhint/browser-context/
