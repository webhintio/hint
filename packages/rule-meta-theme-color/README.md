# Require a 'theme-color' meta tag with a valid value (`@sonarwhal/rule-meta-theme-color`)

`rule-meta-theme-color` rule checks if a single `theme-color` meta tag
is specified in the `<head>` with a valid value.

## Why is this important?

The [`theme-color` meta tag][spec] provides a way to suggest a color
that browsers should use to customize the display of the page or of
the surrounding user interface. For example, browsers might use the
color for the page's title bar, or use it as a color highlight in a
tab bar or task switcher.

So, especially in the context of progressive web apps, for a more
app-like feel, providing a theme color is essential.

Note: Always specify the theme color using the meta tag. Even though
it can also be declared in the [web app manifest file][manifest],
browsers only acknowledge it from there once the user has added the
page to their homescreen.

## How to use this rule?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-meta-theme-color
```

Note: You can make `npm` install it as a `devDependency` using the
`--save-dev` parameter, or to install it globally, you can use the
`-g` parameter. For other options see [`npm`'s
documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.sonarwhalrc`][sonarwhalrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": [...],
    "rules": {
        "meta-theme-color": "error"
    },
    ...
}
```

## What does the rule check?

The rule checks if a single `theme-color` meta tag is specified in
the `<head>` and the value of its `content` attribute is a [valid CSS
color][color] supported by the [targeted browsers](browserslist).

### Examples that **trigger** the rule

The `theme-color` meta tag is not specified:

```html
<!doctype html>
<html lang="en">
    <head>
        <title>example</title>
        ...
    </head>
    <body>...</body>
</html>
```

The `theme-color` meta tag is wrongly specified as `<space>theme-color`:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf8">
        <meta name=" theme-color" content="#f00">
        ...
    </head>
    <body>...</body>
</html>
```

The `theme-color` meta tag is specified with an invalid value:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf8">
        <meta name="theme-color" content="invalid">
        ...
    </head>
    <body>...</body>
</html>
```

The `theme-color` meta tag is not specified in the `<head>`:

```html
<!doctype html>
<html lang="en">
    <head>
        <title>example</title>
        ...
    </head>
    <body>
        <meta name="theme-color" content="#f00">
        ...
    </body>
</html>
```

Multiple `theme-color` meta tags are specified:

```html
<!doctype html>
<html lang="en">
    <head>
        <title>example</title>
        <meta name="theme-color" content="#f00">
        <meta name="theme-color" content="#f0f">
        ...
    </head>
    <body>...</body>
</html>
```

### Examples that **pass** the rule

```html
<!doctype html>
<html lang="en">
    <head>
        <title>example</title>
        <meta name="theme-color" content="#f00">
        ...
    </head>
    <body>...</body>
</html>
```

Note: The `content` attribute value can be any [valid CSS
color][color]. However, the rule will trigger an error for values
that don't make any sense in this context such as `currentcolor`
or values that are not supported by all browsers specified in your
[`browserslist`](browserslist).

Examples of valid values:

* color names

  * `<meta name="theme-color" content="red">`

* `hex` using 3 or 6 digits

  * `<meta name="theme-color" content="#f00">`
  * `<meta name="theme-color" content="#ff0000">`

* `hsl` / `hsla`

  * `<meta name="theme-color" content="hsl(0, 50%, 50%)">`
  * `<meta name="theme-color" content="hsla(0, 50%, 50%, 1)">`

* `rgb` / `rgba`

  * `<meta name="theme-color" content="rgb(255, 0, 0)">`
  * `<meta name="theme-color" content="rgba(255, 0, 0, 1)">`

And, depending on the [targeted
browsers](https://sonarwhal.com/docs/user-guide/further-configuration/browser-context/)
you may also use:

* `hex` using 4 or 8 digits

  * `<meta name="theme-color" content="#f000">`
  * `<meta name="theme-color" content="#ff000000">`

## Further Reading

* [`theme-color` specification][spec]

<!-- Link labels: -->

[browserslist]: https://sonarwhal.com/docs/user-guide/further-configuration/browser-context/
[color]: https://drafts.csswg.org/css-color/#typedef-color
[manifest]: https://www.w3.org/TR/appmanifest/
[spec]: https://html.spec.whatwg.org/multipage/semantics.html#meta-theme-color
