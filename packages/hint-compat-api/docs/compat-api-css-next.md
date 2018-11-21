# Check for CSS features that are not broadly supported

## What does the hint check?
`compat-api-css-next` checks if the CSS features used are
supported in the [targeted browsers][browser-context].

## Why is this important?

New CSS features are being implemented all the time. It's tricky knowing
when a feature has become standard among all browsers, when it needs a prefix,
and when it is not supported. This hint will check if you are using features
that are not supported by your targeted browsers, taking into account prefixes.

### Examples that **trigger** the hint

The [box-flex][box-flex] was
never added for any version of Internet Explorer. If Internet Explorer is
being targeted, using the box-flex property will trigger the hint.

```css
.example {
    box-flex: 1;
}
```

The `flex` value of the [display][display]
property was added for versions of Chrome 29 and onwards. Using `display: flex`
while targeting Chrome browsers of versions less than 29
will trigger the hint.

```css
.example {
    display: flex;
}
```

The at-rule [keyframes][keyframes] was added for versions of Chrome 43 and onwards. Using `@keyframes`
while targeting Chrome browsers of versions less than 43
will trigger the hint.

```css
@keyframes name {
    0% {
        left: 0%;
    }
}
```

The prefixed `flex` value of the
[display][display]
property was added for versions of Chrome 21 and onwards.
Using `display: -webkit-flex` while targeting Chrome browsers of
versions less than 21 will trigger the hint.

```css
.example {
    display: -webkit-flex;
}
```

### Examples that **pass** the hint
The [charset][charset]
at-rule was added from Chrome version 2. It should pass the hint for
versions of Chrome from 2 onwards.

```css
@charset "UTF-8";
```

The [box-flex][box-flex] property
was added with prefixes for Chrome, Firefox, Opera and Safari.
[MDN compat data][browser-compat] does not specify which versions
they were added in, asserting that the property is supported with
prefixes, regardless of version. If box-flex is used with prefixes,
it should pass the hint for these browsers.

```css
.example {
    -webkit-box-flex: 0;
    -moz-box-flex: 0;
}
```

The `capitalize` property of [text-transform][text-transform]
does not have any information about when it was added to various browsers
according to the  [MDN compat data][browser-compat]. No error is thrown
if there is no information available on when, or if, the feature was added.

```css
.example {
    text-transform: capitalize;
}
```

## Can the hint be configured?

This hint throws errors for CSS features that are not supported in any of the
[targeted browsers][targeted-browsers] listed.

The targeted browsers can be defined in either the `.hintrc` or `package.json` file.
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

[docmdn]: https://developer.mozilla.org/en-US/docs/Web/CSS
[box-flex]: https://developer.mozilla.org/en-US/docs/Web/CSS/box-flex
[browser-compat]: https://github.com/mdn/browser-compat-data
[browser-context]: https://webhint.io/docs/user-guide/configuring-webhint/browser-context/
[browserslist]: https://github.com/browserslist/browserslist#readme
[charset]: https://developer.mozilla.org/en-US/docs/Web/CSS/@charset
[display]: https://developer.mozilla.org/en-US/docs/Web/CSS/display
[keyframes]: https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes
[targeted-browsers]: ../../hint/docs/user-guide/configuring-webhint/browser-context.md
[text-transform]: https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform
