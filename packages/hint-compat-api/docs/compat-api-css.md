# Check for Deprecated CSS features
`compat-api-css` checks if the CSS features used are deprecated in the [targeted browsers](../../hint/docs/user-guide/configuring-webhint/browser-context.md) 

## Why is this important?

Deprecated CSS APIs should not be used as browsers may no longer provide support for these APIs.

### Examples that **trigger** the hint
The [box-lines](https://developer.mozilla.org/en-US/docs/Web/CSS/box-lines) property is deprecated and was removed in Chrome 67, Safari 3 and Opera 54.

```css
.example {
    box-lines: single;
    box-lines: multiple;
}
```

The [box-flex-group](https://developer.mozilla.org/en-US/docs/Web/CSS/box-flex-group) property is deprecated and was removed in Chrome 67, Webview Android 67 and Opera 54.

```css
.example {
    box-flex-group: 1;
    box-flex-group: 5;
}
```

The non-standard Mozilla CSS extension, [moz-text-blink](https://developer.mozilla.org/en-US/docs/Web/CSS/-moz-text-blink) is obsolete since Gecko 26 (Firefox 26 / Thunderbird 26 / SeaMonkey 2.23 / Firefox OS 1.2).

```css
.example {
  -moz-text-blink: blink;
}
```

### Examples that **pass** the hint

The [background](https://developer.mozilla.org/en-US/docs/Web/CSS/background) CSS property which was added for all browsers since their earliest versions, e.g. Chrome 1, Firefox 1, Internet Explorer 4.

```css
.example-class {
    background: green;
}

#example-id {
    background: no-repeat url("../../media/examples/lizard.png");
}

```

The [@media CSS at-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/@media) which was added for most popular browsers since their earliest versions, e.g. Chrome 1, Firefox 1, Safari 1.3.

## Can the hint be configured?

This hint throws errors for CSS features that have been deprecated in any of the [targeted browsers](../../hint/docs/user-guide/configuring-webhint/browser-context.md) listed.

The targeted browsers can be defined in either the `.hintrc` or `package.json` file. This property follows the same convention as [browserlist](https://github.com/browserslist/browserslist#readme).

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

<!-- Link labels: -->

[docmdn]: https://developer.mozilla.org/en-US/docs/Web/CSS
