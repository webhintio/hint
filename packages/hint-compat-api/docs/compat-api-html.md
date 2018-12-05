# Check for Deprecated HTML elements

## What does the hint check?

`compat-api-html` checks if the HTML elements and attributes used are deprecated in the
[targeted browsers][browser-context].

## Why is this important?

Deprecated HTML elements and attributes should not be used
as browsers may no longer provide support for them.
It can be tricky knowing when browser support for HTML elements
and attributes have been removed. This hint will check if you
are using HTML elements and attributes that have been deprecated.

### Examples that **trigger** the hint

The [blink][blink] element is deprecated was removed in Firefox 22.
Targeted Firefox browsers of versions 22 and up will trigger the hint.

```html
<blink>Why would somebody use this?</blink>
```

The `scoped` attribute of the [style][style] element is deprecated
and was removed in Firefox 55. Targeted Firefox browsers of versions
55 and up will trigger the hint.

```html
<style scoped>
    h1 {color:red;}
</style>
```

The global attribute [contextmenu][contextmenu] was removed
from Firefox Android 56. Targeted Firefox Android browsers
of versions 56 and up will trigger the hint.

```html
<body contextmenu="share"></body>
```

### Examples that **pass** the hint

The [div][div] element was never removed for any browser.
It should always pass the hint.

```html
<div></div>
```

The `method` attribute of the [form][form] element was never
removed for any browser. It should always pass the hint.

```html
<form method="get"></form>
```

The global attribute [class][class] was never removed for any browser.
It should always pass the hint.

```html
<div class="foobar"></div>
<p class="foobar"></p>
```

## Can the hint be configured?

This hint throws errors for HTML elements that have been deprecated in any
of the [targeted browsers][targeted-browsers] listed.

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
[style]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style
[div]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div
[form]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form
[contextmenu]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contextmenu
[class]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/class
[browser-compat]: https://github.com/mdn/browser-compat-data
[browser-context]: https://webhint.io/docs/user-guide/configuring-webhint/browser-context/
[browserslist]: https://github.com/browserslist/browserslist#readme
[docmdn]: https://developer.mozilla.org/en-US/docs/Web/HTML
[targeted-browsers]: ../../hint/docs/user-guide/configuring-webhint/browser-context.md
