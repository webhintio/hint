# Warn if the byte-order mark (BOM) chararcter is at beginning of a text file (`@sonarwhal/rule-no-bom`)

`no-bom` warns against having the byte-order mark (BOM) character at the
beginning of a text file.

## Why is this important?

Having the BOM character at the beginning of a file over the internet
(especially HTML) can have some bad side effects on some browsers. The BOM
character can be used to indicate the charset of the content is `UTF-8` but
this doesn't mean it will be taken into account. For example, IE10 and IE11
give a higher precedence to the HTTP header while previous versions gave the
precedence to BOM for the encoding.

You can learn about other problems in [this section][bom problems].

## What does the rule check?

This rule checks that all text based media type files are served without the
BOM character at the beginning.

### Examples that **trigger** the rule

A text file (such as HTML) that starts with the BOM character `U+FEFF`
will fail.

### Examples that **pass** the rule

A text file (such as HTML) that doesn't start with the BOM character `U+FEFF`
will pass.

## How to use this rule?

To use it you will have to install it via `npm`:

```bash
npm install @sonarwhal/rule-no-bom
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
    "parsers": [...],
    "rules": {
        "no-bom": "error"
    },
    ...
}
```

## Further Reading

* [Byte order mark (Wikipedia)][bom]
* [The byte-order mark (BOM) in HTML][bom in html]

<!-- Link labels: -->

[bom]: https://en.wikipedia.org/wiki/Byte_order_mark
[bom in html]: https://www.w3.org/International/questions/qa-byte-order-mark.en
[bom problems]: https://www.w3.org/International/questions/qa-byte-order-mark.en#problems
[sonarwhalrc]: https://sonarwhal.com/docs/user-guide/further-configuration/sonarwhalrc-formats/
