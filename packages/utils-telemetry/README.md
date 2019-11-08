# Utils telemetry (`@hint/utils-telemetry`)

TK

## API

### `getFriendlyName`

Get the friendly name of a browser from an id.

```js
import { getFriendlyName } from '@hint/utils-compat-data';

console.log(getFriendlyName('and_ff')); // "Firefox Android"
console.log(getFriendlyName('ie')); // "Internet Explorer"
```

### `getUnsupported`

Filter the list of given `browsers` to return those that do not support the
given CSS or HTML feature.

It accepts a `FeatureQuery` and a list of browsers.

```js
import { getUnsupported } from '@hint/utils-compat-data';

console.log(getUnsupported({ element: 'details' }, ['chrome 74', 'ie 11'])); // ['ie 11']
console.log(getUnsupported(
    {
        attribute: 'rel',
        element: 'link',
        value: 'noopener'
    },
    ['edge 12', 'firefox 63'])); // ['edge 12']
```

<!-- Link labels -->

[bl browsers]: https://github.com/browserslist/browserslist#browsers
[mdn browsers]: https://github.com/mdn/browser-compat-data/tree/master/browsers
[mdn-browser-compat-data]: https://www.npmjs.com/package/mdn-browser-compat-data
