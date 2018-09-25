# Browser configuration

`webhint` allows you to define what browsers are relevant to your
scenario by adding the property `browserslist` to your `.hintrc`
file, or in the `package.json` file. This property follows the same
convention as [`browserslist`][browserslist]:

```json
{
    "browserslist": [
        "> 1%",
        "last 2 versions"
    ]
}
```

By specifying this property, you are giving more context to the hints
allowing them to adapt their behavior. An example of a hint taking
advantage of this property is [`highest-available-document-mode`][doc
modes]. This hint will advice to use `edge` mode if Internet Explorer
8, 9, or 10 need to be supported, but tell you to remove that tag or
header otherwise, as document modes are not needed for other browsers.

If no value is defined, [`browserslist`’s defaults][browserslist
defaults] will be used:

```js
browserslist.defaults = [
    '> 1%',
    'last 2 versions',
    'Firefox ESR'
];
```

<!-- Link labels: -->

[browserslist]: https://github.com/ai/browserslist#readme
[browserslist defaults]: https://github.com/ai/browserslist#queries
[doc modes]: ../hints/hint-highest-available-document-mode/
