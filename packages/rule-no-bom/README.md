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

## Further Reading

* [Byte order mark (Wikipedia)][bom]
* [The byte-order mark (BOM) in HTML][bom in html]

[bom]: https://en.wikipedia.org/wiki/Byte_order_mark
[bom in html]: https://www.w3.org/International/questions/qa-byte-order-mark.en
[bom problems]: https://www.w3.org/International/questions/qa-byte-order-mark.en#problems
