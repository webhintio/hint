# Check for HTML elements that are not broadly supported

## What does the hint check?

`compat-api-html-next` checks if the HTML elements and attributes used are
supported in the [targeted browsers][browser-context].

## Why is this important?

New HTML elements and attributes are being implemented all the time.
It's tricky knowing when an element or attribute has become standard
among all browsers. This hint will check if you are using elements or
attributes that are not supported by your targeted browsers.

### Examples that **trigger** the hint

The [blink][blink] element was never added on any version of Chrome.
Targeting Chrome browsers of any version will trigger the hint.

```html
<blink>Why would somebody use this?</blink>
```

The `srcset` attribute of the [img][img] element was never
added on any version of Internet Explorer. Targeting
Internet Explorer browsers of any version will trigger the hint.

```html
<img srcset="foo.jpg, bar.jpg">
```

The [video][video] element and its `autoplay` attribute was added for versions
of Internet Explorer 9 and onwards. Targeting versions of Internet Explorer
below version 9 will trigger the hint for the element and its attribute.

```html
<video autoplay></video>
```

The [input type][input-type] [`color`][input-type-color] was not added for any
version of Internet Explorer. Targeting any version of Internet Explorer
will trigger the hint for this input type.

```html
<input type="color">
```

The [global attribute][global-attr] `class` was added for versions of Firefox
32 and onwards. Targeting versions of Firefox below version 32 till trigger
the hint for the attribute.

```html
<div class="foobar"></div>
<p class="foobar"></p>
```

### Examples that **pass** the hint

The [div][div] element has been added for all versions of all browsers.
It will pass the hint regardless of whatever the targeted browsers are.

```html
<div></div>
```

The [global attribute][global-attr] `class` has been added for all versions of
all browsers except Firefox and Firefox for Android. Targeted browsers that are
not Firefox will pass the hint regardless of their version.

```html
<div class="container"></div>
<p class="about"></p>
```

The `alt` attribute of the [img][img] element has been added for all versions
of all browsers. It will pass the hint regardless of whatever the targeted
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
[targeted browsers][targeted-browsers] listed.

The targeted browsers can be defined in either the `.hintrc` or
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

## Further Reading

* [CSS: Cascading Style Sheets (MDN)][docmdn]
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
[targeted-browsers]: ../../hint/docs/user-guide/configuring-webhint/browser-context.md
