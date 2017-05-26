# CDP

The `CDP` collector uses the [Chrome Debugging
Protocol](https://chromedevtools.github.io/devtools-protocol/) to
communicate with the browser.

## Configurations

The following properties can be customized in your `.sonarrc` file, under the
`options` property of the `collector`:

* `maxLoadWaitTime` the max time in milliseconds the collector will wait for
  the website to be ready before continuing. The default value is `30000`
  milliseconds.
* `loadCompleteRetryInterval` time in milliseconds the collector will wait
  before checking again if the website is ready (all the resources are loaded
  and no pending network requests). The default value is `500` milliseconds.
  The maximum number of retries is defined by
  `maxLoadWaitTime/loadCompleteRetryInterval`.
  E.g.: `loadCompleteRetryInterval = 10000` and `maxLoadWaitTime = 30000` means
  that at most there will be 3 retries () to check if everything is loaded
  before continuing the execution.
* `waitFor` time in milliseconds the collector will wait after the site is
  ready before starting the DOM traversing. The default value is `5000`
  milliseconds.

The following is the default configuration:

```json
{
    "collector": {
        "name": "cdp",
        "options": {
            "waitFor": 5000,
            "loadCompleteRetryInterval": 500,
            "maxLoadWaitTime": 30000
        }
    }
}
```
