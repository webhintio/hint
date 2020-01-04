# Browser configuration

`webhint` allows you to define what browsers are relevant to your
scenario by adding the property `browserslist` to your `package.json`
file as defined by [`browserslist`][browserslist]:

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
modes]. This hint will advise you to use `edge` mode if Internet
Explorer 8, 9, or 10 needs to be supported, but tell you to remove that
element or header otherwise, as document modes are not needed for other
browsers.

If no value is defined, [`browserslist`’s defaults][browserslist
defaults] will be used:

```js
browserslist.defaults = [
    '> 0.5%',
    'last 2 versions',
    'Firefox ESR',
    'not dead'
];
```

You can also configure browsers using any other
[`browserslist` configuration option][browserslist defaults], such as
`.browserslistrc`.

If you need to configure browsers for `webhint` without affecting
other tools, you can specify a `browserslist` property in your
`.hintrc` file using the same format. This list will take precedence
over any `browserslist` specified elsewhere when using `webhint`.

<!-- Link labels: -->

[browserslist]: https://github.com/ai/browserslist#readme
[browserslist defaults]: https://github.com/ai/browserslist#queries
[doc modes]: https://webhint.io/docs/user-guide/hints/hint-highest-available-document-mode/
