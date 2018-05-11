# js-minify-check (`@sonarwhal/rule-js-minify-check`)

This rule checks whether javascript used by your web page is minified or not.

## Why is this important?

Minifying your javascript is a great way to improve your page load time.
This includes removing unused variables & methods, renaming variables & methods to small
variable names, removing code comments etc.Minification should generate a smaller file.
Smaller file=>Less bytes to send to browser => less code to parse.

## How to use this rule?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-js-minify-check
```

Note: You can make `npm` install it as a `devDependency` using the `--save-dev`
parameter, or to install it globally, you can use the `-g` parameter. For
other options see
[`npm`'s documentation](https://docs.npmjs.com/cli/install).

And then activate it via the [`.sonarwhalrc`][sonarwhalrc]
configuration file:

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": ["javascript"],
    "rules": {
        "js-minify-check": "error"
    },
    ...
}
```

## Can the rule be configured?

By default, the rule uses `75` as the threshold value. But you can configure that as part of your [`.sonarwhalrc`][sonarwhalrc]
config

```json
{
    "connector": {...},
    "formatters": [...],
    "parsers": ["javascript"],
    "rules": {
        "js-minify-check": ["error", {
            "threshold": 80
        }]
    },
    ...
}
```

*The value 75 was derived after running test on some of the mostly used libraries
and a couple of custom javascript files.*

## Further Reading

Here are some useful topics if you are new to minification

[Minification](https://en.wikipedia.org/wiki/Minification_(programming))

[Minify Resources (HTML, CSS, and JavaScript)](https://developers.google.com/speed/docs/insights/MinifyResources)
<!-- Link labels: -->

[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
