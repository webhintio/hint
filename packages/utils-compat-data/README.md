# Utils compat data (`@hint/utils-compat-data`)

This package allows you to easily query the data from [mdn-browser-compat-data][]
to learn about the support status of a feature.

The type of information you can query is explained below:

## API

The supported datasets are CSS and HTML. Most of the exposed functionality
uses a `FeatureQuery` to indicate the type of information you are querying.
You can retrieve information for:

* Attributes:

```ts
export type AttributeQuery = {
    attribute: string;
    element?: string;
    value?: string;
};
```

* Elements:

```ts
export type ElementQuery = {
    element: string;
};
```

* Declarations:

```ts
export type DeclarationQuery = {
    property: string;
    value?: string;
};
```

* Rules:

```ts
export type RuleQuery = {
    rule: string;
};
```

* Selectors:

```ts
export type SelectorQuery = {
    selector: string;
};
```

Most of the functions accept a `FeatureQuery` and a list of browser
ids to check. This package accepts two different formats of browsers
ids: browserslist or MDN.

The friendly names and ids for each one are as follows:

| Browser name | [Browserslist][bl browsers] | [MDN][mdn browsers] |
| ------------ | ------------ | --------- |
| Chrome       | chrome       | chrome |
| Chrome Android | and_chr    | chrome_android |
| Edge         | edge         | edge |
| Firefox      | ff           | firefox |
| Firefox Android | and_ff    | firefox_android |
| Internet Explorer | ie      | ie |
| Opera        | opera        | opera |
| Opera Android | op_mobile   | opera_android |
| QQ Android   | and_qq       | qq_android |
| Safari       | safari       | safari |
| Safari iOS   | ios_saf      | safari_ios |
| Samsung Internet | samsung  | samgsunginternet_android |
| UC Android   | and_uc       | uc_android |
| Webview Android | android   | webview_android |

You can check the next sections for example on how to use `FeatureQuery`s
and list of browsers.

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

### `getUnsupportedDetails`

Get browsers without support with details on when support was added or removed.

Similar to `getUnsupported`, but returns an object with both a list of:

* `browsers` which were unsupported and a map of browsers to `browserDetails`
* to get additional information (e.g. what version the feature is added in).

It accepts a `FeatureQuery` and a list of browsers.

```js
import { getUnsupportedDetails } from '@hint/utils-compat-data';

const unsupportedInfo = getUnsupportedDetails(
    { property: 'appearance' },
    ['chrome 75', 'firefox 63']);
```

`unsupportedInfo` will look something like the following:

```json
{
    "browsers": [ "chrome 75", "firefox 63" ],
    "details": {
        "chrome 75": {
            "alternative": {
                "name": "-webkit-appearance",
                "versionAdded": 1
            }
        },
        "firefox 63": {
            "alternative": {
                "name": "-moz-appearance",
                "versionAdded": 1
            }
        }
    }
}
```

**Note**: `details` is a `Map` that uses the browser versions as keys.

### `getSupported`

Filters the list of `browsers` with those that support the given CSS or HTML feature.
This is the opposite of `getUnsupported`.

It accepts a `FeatureQuery` and a list of browsers.

```js
import { getSupported } from '@hint/utils-compat-data';

console.log(getSupported({ element: 'details' }, ['chrome 74', 'ie 11'])); // ['chrome 74']
console.log(getSupported(
    {
        attribute: 'rel',
        element: 'link',
        value: 'noopener'
    },
    ['edge 12', 'firefox 63'])); // ['firefox 63']
```

### `isSupported`

Query MDN for support of CSS or HTML features. It returns `true` if all
the `browsers` support it, `false` otherwise.

It accepts a `FeatureQuery` and a list of browsers.

```js
import { isSupported } from '@hint/utils-compat-data';

console.log(isSupported({ element: 'details' }, ['ie 11'])); // false
```

<!-- Link labels -->

[bl browsers]: https://github.com/browserslist/browserslist#browsers
[mdn browsers]: https://github.com/mdn/browser-compat-data/tree/master/browsers
[mdn-browser-compat-data]: https://www.npmjs.com/package/mdn-browser-compat-data
