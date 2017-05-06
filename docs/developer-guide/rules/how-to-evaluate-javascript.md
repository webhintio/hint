# How to evaluate JavaScript

Sometimes a rule needs to evaluate some JavaScript in the context of the page.
To do that you need to use `context.evaluate`. This method will always return
a `Promise` even if your code does not return one.

One important thing is that your code needs to be wrapped in an Immediate
Invoked Function Expression to work.

The following scripts will work:

<!-- eslint-disable -->

```js
const script =
`(function() {
    return true;
}())`;

context.evaluate(script);
```

```js
const script =
`(function() {
    return Promise.resolve(true);
}())`;

context.evaluate(script);
```

The following does not:

```js
const script = `return true;`;

context.evaluate(script);
```

```js
const script = `return Promise.resolve(true);`;

context.evaluate(script);
```
