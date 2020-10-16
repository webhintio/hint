# Internet Explorer Flexbox Compatibility (`ie-flexbox-compat`)

`ie-flexbox-compat` warns about potential CSS Flexbox compatibility bugs with Internet Explorer.

## Why is this important?

Internet Explorer 11 and older suffer from a number of CSS Flexbox compatibility bugs.\
In some cases, the CSS Flexbox specification changed after Internet Explorer implemented it, in others, the
implementation was just incorrect.

Because of this, the layout on your site may be different between Internet Explorer and other browsers if you
use Flexbox.\
The size or alignment of elements may be incorrect or content may overflow.

As described in [Microsoft's support policy for Internet Explorer][IE support policy], support for older
versions of this browser ended and Microsoft no longer provides security updates or technical support for
these versions.\
It is therefore discouraged to introduce flexbox if you still need to target IE.

You can find more information about each individual bug as well workarounds for them on the
[Flexbugs repository][flexbugs].

## What does the hint check?

This hint checks two things:

* That the configured target browsers include Internet Explorer.
* And that CSS on your site uses flexbox.

### Examples that **trigger** the hint

If your site declares a flexbox container by using:

```css
#container {
    display: flex;
}
```

Or by using:

```css
#container {
    display: inline-flex;
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
        "ie-flexbox-compat": "warning",
        ...
    },
    "parsers": [...],
    ...
}
```

**Note**: The recommended way of running webhint is as a `devDependency` of
your project.

[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[IE support policy]: https://www.microsoft.com/en-us/microsoft-365/windows/end-of-ie-support
[flexbugs]: https://github.com/philipwalton/flexbugs
