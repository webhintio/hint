# Browser configuration

`sonarwhal` allows you to define what browsers are relevant to your
scenarion by adding the property `browserslist` to your `.sonarwhalrc`
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

By specifying this property, you are giving more context to the rules
allowing them to adapt their behavior. An example of a rule taking
advantage of this property is [`highest-available-document-mode`](./rules/highest-available-document-mode.md).
This rule will advice you to use `edge` mode if you need to support
versions of IE prior IE10, or tell you to remove that tag or header
it you only need IE11+ because document modes were removed at that
version.

If no value is defined, [`browserslist`’s defaults][browserslist defaults] will
be used:

```js
browserslist.defaults = [
    '> 1%',
    'last 2 versions',
    'Firefox ESR'
];
```
