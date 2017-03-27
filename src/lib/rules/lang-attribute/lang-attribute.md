# Require `lang` attribute on the `html` element (`lang-attribute`)

`lang-attribute` warns against not using the `lang` attribute on the
`html` element, or using it on the `html` element without a value, or
with the value of empty string.


## Why is this important?

It's indicated to always set the `lang` attribute on the `html` element
so that it sets the primary language of the document, and it's inherited
by all other elements ([even the ones in the
`<head>`](https://www.w3.org/International/questions/qa-html-language-declarations#basics)),

Setting the `lang` attribute provides an explicit indicate to user
agents about the language of the content, which can help, among other:

 * [screen readers and similar assistive technologies with voice
   output and pronunciation of content using the correct voice/language
   library](http://blog.adrianroselli.com/2015/01/on-use-of-lang-attribute.html)

 * determine the appropriate language dictionary, the types of
   [quotation marks for `q` elements](https://www.w3.org/International/questions/qa-lang-why#rendering),
   the styling such as the one for
   [hyphenation](http://www.quirksmode.org/blog/archives/2012/11/hyphenation_wor.html),
   [case conversion, line-breaking, and
   spell-checking](https://www.w3.org/International/questions/qa-lang-why#authoring)

 * [font selection where different alphabets are
   mixed](https://www.w3.org/International/questions/qa-lang-why#fonts)

 * improve localization (e.g. [what numeric software keyboard will be
   opened for `<input type="number">`](https://ctrl.blog/entry/html5-input-number-localization))


## What does it check?

The rule checks if the `lang` attribute was specified on the
`html` element and it has a value different from an empty string.

Examples that **trigger** the rule:

* `lang` attribute is not specified on the `html` element.

  ```html
  <!doctype html>
  <html>
      <head>
          <title>example</title>
      </head>
      <body></body>
  </html>
  ```

  ```html
  <!doctype html>
  <html>
      <head>
          <title>example</title>
      </head>
      <body lang="en"></body>
  </html>
  ```

* `lang` attribute is specified on the `html` element,
  but has not value.

  ```html
  <!doctype html>
  <html lang>
      <head>
          <title>example</title>
      </head>
      <body></body>
  </html>
  ```

* `lang` attribute is specified on the `html` element,
  but has the value of empty string.

  ```html
  <!doctype html>
  <html lang="">
      <head>
          <title>example</title>
      </head>
      <body></body>
  </html>
  ```

Examples that **pass** the rule:

```html
<!doctype html>
<html lang="en">
    <head>
        <title>example</title>
    </head>
    <body></body>
</html>
```


## Further Reading

* [Declaring the language in HTML](https://www.w3.org/International/questions/qa-html-language-declarations)
* [Why use the language attribute?](https://www.w3.org/International/questions/qa-lang-why)
