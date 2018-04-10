# `is-valid`

## Why is this important?

To avoid problems in your project, the webpack configuration has to be valid.

## What does the rule check?

This rule checks if the Webpack configuration file is valid.

### Examples that **trigger** the rule

The `webpack.config.js` has is an invalid javascript:

```js
module.exports = {
    entry: 'invalid,
    output: {
        filename: 'bundle.js'
    }
};
```

### Examples that **pass** the rule

The configuration is valid:

```js
const path = require('path');

module.exports = {
    entry: ['entry'],
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist')
    }
};
```

## Further Reading

* [Webpack Documentation][webpack docs]

[webpack docs]: https://webpack.js.org/concepts/