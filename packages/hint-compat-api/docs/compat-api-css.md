# Check for Deprecated CSS features

## What does the hint check?
`compat-api-css` checks if the CSS features used are deprecated in the [targeted browsers][browser-context].

## Why is this important?

Deprecated CSS APIs should not be used as browsers may no longer
provide support for these APIs. It can be tricky knowing when browser
support for CSS features have been removed - and whether the support
was removed for the prefixed or non-prefixed version of the feature.
This hint will check if you are using features that have been deprecated,
taking into account prefixes.

### Examples that **trigger** the hint

The [box-lines](https://developer.mozilla.org/en-US/docs/Web/CSS/box-lines) property
was added with the `-webkit-` prefix for Chrome and removed from versions of Chrome 67 and onwards.
Targeted Chrome browsers of versions 67 and up will trigger the hint.

```css
.example {
    -webkit-box-lines: single;
}
```

The `padding-box` value of the [box-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing)
property is deprecated and was removed in Firefox 50.
Targeted Firefox browsers of versions 50 and up will trigger the hint.

```css
.example {
    box-sizing: padding-box;
}
```

The non-prefixed [keyframes](https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes)
at-rule was removed from Opera 15. Targeted Opera browsers of versions 15
and up will trigger the hint if the at-rule is used without the `-webkit-` prefix.

```css
@keyframes name {
    0% {
        left: 0%;
    }
}
```

### Examples that **pass** the hint
The [background](https://developer.mozilla.org/en-US/docs/Web/CSS/background) property was never
removed for any browser. It should always pass the hint.

```css
.example {
    background: firebrick;
}
```

The [box-lines](https://developer.mozilla.org/en-US/docs/Web/CSS/box-lines) property
was added with prefixes for Chrome, Opera and Safari. Although the prefixed property
was removed for these browsers subsequently, using the property without a prefix will
not trigger the hint since the non-prefixed version of `box-lines` was never added
and thus never deprecated.

```css
.example {
    box-lines: single;
}
```

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
* [Browser Compat Data (MDN)][browser-compat]

<!-- Link labels: -->

[docmdn]: https://developer.mozilla.org/en-US/docs/Web/CSS
[browser-compat]: https://github.com/mdn/browser-compat-data
[browser-context]: https://webhint.io/docs/user-guide/configuring-webhint/browser-context/

