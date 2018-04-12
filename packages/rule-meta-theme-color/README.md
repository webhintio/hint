# Require a 'theme-color' meta tag with a valid value (`@sonarwhal/rule-meta-theme-color`)

`rule-meta-theme-color` rule checks if a single `theme-color` meta tag
is specified in the `<head>` with a valid value supported by all user
agents.

## Why is this important?

The [`theme-color` meta tag][theme-color spec] provides a way to
suggest a color that browsers should use to customize the display
of the page or of the surrounding user interface. For example,
browsers might use the color for the page's title bar, or use it
as a color highlight in a tab bar or task switcher.

In the context of [progressive web apps][pwas], for a more app-like
feel, providing a theme color is essential.

Here is an example of browser UI when the `theme-color` meta tag is
not specified and when it is:

![Browser UI when the theme-color meta tag is not specified](images/no_theme-color.png)
&nbsp; ![Browser UI when the theme-color meta tag is specified](images/theme-color.png)

Note that:

* While the [specification][theme-color spec] defines that the theme
  color can be any [valid CSS color][css color]:

  * Values such as [`hex with alpha` are not supported][hex with alpha
    support] everywhere `theme-color` is.

  * Browsers that suppoted `rgba`, `hsla`, or `hex with alpha` values
    will ignore the alpha value.

  * Windows/Microsoft Store requires the color to be specified either
    as `hex` or as a color name.

  So, for interoperability, it's recommended to specify the theme color
  either using `hex` or a color name.

* Always specify the theme color using the meta tag. Even though
  it can also be declared in the [web app manifest file][manifest]:

  * Browsers only acknowledge the value from the web app manifest
    file once the user has added the page to their homescreen.

  * The `theme-color` meta tag overwrites the value specified in the
    web app manifest file so it allows for better individual page level
    customization.

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
the `<head>` and the value of its `content` attribute is a [valid
CSS color][css color] supported everywhere `theme-color` meta tag is.

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
<meta name=" theme-color" content="#f00">
```

The `theme-color` meta tag is specified with an invalid value:

```html
<meta name="theme-color" content="invalid">
```

```html
<meta name="theme-color" content="currentcolor">
```

The `theme-color` meta tag is specified with value that is not
supported everywhere:

```html
<meta name="theme-color" content="#f00a">
```

```html
<meta name="theme-color" content="#ff0000aa">
```

```html
<meta name="theme-color" content="hsl(0, 50%, 50%)">
```

```html
<meta name="theme-color" content="hsla(0, 50%, 50%, 1)">
```

```html
<meta name="theme-color" content="rgb(255, 0, 0)">
```

```html
<meta name="theme-color" content="rgba(255, 0, 0, 1)">
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

A single `theme-color` meta tag is specified in the `<head>` and
the value of its `content` attribute is a [valid CSS color][css
color] supported everywhere:

```html
<!doctype html>
<html lang="en">
    <head>
        <title>example</title>
        <meta name="theme-color" content="red">
        ...
    </head>
    <body>...</body>
</html>
```

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

## Further Reading

* [`theme-color` specification][theme-color spec]

<!-- Link labels: -->

[css color]: https://drafts.csswg.org/css-color/#typedef-color
[hex with alpha support]: ]
[manifest]: https://www.w3.org/TR/appmanifest/
[pwas]: https://developer.mozilla.org/en-US/Apps/Progressive
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
[theme-color spec]: https://html.spec.whatwg.org/multipage/semantics.html#meta-theme-color
