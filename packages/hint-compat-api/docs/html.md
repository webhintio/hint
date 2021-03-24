# Supported HTML features (`compat-api/html`)

## What does the hint check?

`compat-api/html` checks if the HTML elements and attributes used are
supported in all [target browsers][browser-context].

## Why is this important?

New HTML elements and attributes are being implemented all the time.
It's tricky knowing when an element or attribute has become standard
among all browsers. This hint will check if you are using elements or
attributes that are not supported by your target browsers.

### Examples that **trigger** the hint

The [blink][blink] element was never added to any version of Chrome.
Targeting Chrome browsers of any version will trigger the hint.

```html
<blink>Why would somebody use this?</blink>
```

The `srcset` attribute of the [img][img] element was never
added to any version of Internet Explorer. Targeting
Internet Explorer browsers of any version will trigger the hint.

```html
<img srcset="foo.jpg, bar.jpg">
```

The [input type][input-type] [`color`][input-type-color] was not added for any
version of Internet Explorer. Targeting any version of Internet Explorer
will trigger the hint for this input type.

```html
<input type="color">
```

### Examples that **pass** the hint

The [div][div] element has been added for all versions of all browsers.
It will pass the hint regardless of whatever your target browsers are.

```html
<div></div>
```

The `alt` attribute of the [img][img] element has been added for all versions
of all browsers. It will pass the hint regardless of whatever your target
browsers are.

```html
<img alt="mountains">
```

The [video][video] element and its `autoplay` attribute was added for versions
of Internet Explorer 9 and onwards. Versions of Internet Explorer from version
9 onwards will pass the hint.

```html
<video autoplay></video>
```

## Can the hint be configured?

This hint throws errors for HTML elements that are not supported in any of the
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

`ignore` can be used to specify a list of HTML features to be ignored. The
default value is:

```json
[
    "a[rel=noopener]",
    "autocomplete",
    "crossorigin",
    "integrity",
    "link[rel]",
    "main",
    "spellcheck"
]
```

In the `.hintrc` file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "compat-api/html": ["error", {
            "ignore": ["blink"],
        }],
        ...
    },
    ...
}
```

`enable` can be used to specify a list of HTML features to be checked even if
they are included in the ignore list. The default value is `[]`.

In the `.hintrc` file:

```json
{
    "connector": {...},
    "formatters": [...],
    "hints": {
        "compat-api/html": ["error", {
            "enable": ["integrity"],
        }],
        ...
    },
    ...
}
```

## Limitations

HTML features not represented in MDN will pass to avoid false-positives.
These could result from data missing for a particular browser or because a
bogus element was used.

## Further Reading

* [HTML: Hypertext Markup Language (MDN)][docmdn]
* [Browser Compat Data (MDN)][browser-compat]

<!-- Link labels: -->

[blink]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/blink
[img]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
[video]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
[div]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div
[input-type-color]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color
[input-type]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
[global-attr]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
[docmdn]: https://developer.mozilla.org/en-US/docs/Web/HTML
[browser-compat]: https://github.com/mdn/browser-compat-data
[browser-context]: https://webhint.io/docs/user-guide/configuring-webhint/browser-context/
[browserslist]: https://github.com/browserslist/browserslist#readme
[target-browsers]: https://webhint.io/docs/user-guide/configuring-webhint/browser-context/
