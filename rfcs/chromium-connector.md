# 🚀 Feature request: `connector-chromium` + custom actions

## TL;DR;

Even though we have a `chrome connector` it should probably be renamed to `chromium` as it works with any `chromium` browser that exposes the `chrome DevTools Protocol`. Even `chrome-launcher` supports the environment variable `CHROME_PATH` to indicate the executable of the browser to run.

This alone is not a good reason, so this enoughWhile renaming for the sake of renaming is probably not a good idea, I think we should take this opportunity to modernize the code and create a new connector that will use [`Puppeteer`](https://github.com/GoogleChrome/puppeteer) which was not available when we first started the project.

Using `Puppeteer` will unlock requests like [custom actions](#421) more easily and with ergonomics that developers already know.

## Details

This section contains a list of all the changes and/or new features `connector-chromium`, the CLI, and the Node.js API should implement with some details on how to achieve them.

### User actions

This has been a long standing issue (#421, #1946). The main scenario to unlock is user authentication via the CLI, without forgetting users that need more control of the page before analyzing it. An example of the later will be to click in different elements before triggering the analysis.

The Node.js API should just expose a general way to perform custom actions and the CLI should take advantage of it to allow user authentication.

#### User authentication in the CLI

The authentication steps should be handled by the CLI using the actions ergonomics provided by the Node.js API.

A typical login experience has a user and password `input`s and a submit `button` (everything might or not be inside a `form`). The user fills the inputs, pressed the button, and then the website navigates to another page or updates the URL with a hash. Puppeteer considers a navigation any change in the url, even if it is just a hash so this should cover the most common scenarios.

The information required to do this programatically is:

* **user value** and **`input` selector**
* **password value** and **`input` selector**
* **button selector** so it can be `click`ed

In total 5 pieces of information.

The most common ways to provide variables to a CLI are (from lower to higher priority):

1. Environment variables
1. Configuration file (`.hintrc`)
1. CLI parameters
1. A mix of the above: the user provides the selectors via `.hintrc` but uses environment variables for the credentials

With this in mind, the options would be:

| Entry Point | Values  |
| ----------- | ------- |
| ENV         | `WEBHINT_AUTH_USER` <br> `WEBHINT_AUTH_PASSWORD` <br> `WEBHINT_AUTH_USER_SELECTOR` <br> `WEBHINT_AUTH_PASSWORD_SELECTOR` <br> `WEBHINT_AUTH_SUBMIT` |
| CLI         | `user`, `-u` <br> `password`, `-p` <br> `user-selector`, `-us` <br> `password-selector`, `-ps` <br> `submit`, `-s`
| Configuration | `user`, `password` and `submit` properties <br> in `options` with `selector` and `value`. <br> See below for example |

`.hintrc` example:

```json
{
  "connector": {
    "name": "chromium",
    "options": {
      "auth": {
        "user": {
          "selector": "",
          "value": ""
        },
        "password": {
          "selector": "",
          "value": ""
        },
        "submit": {
          "selector": ""
        }
      }
    }
  }
  // ...
}
```

An example of a combination of these methods is:

```json
{
  "connector": {
    "name": "chromium",
    "options": {
      "auth": {
        "user": {
          "selector": "#user"
        },
        "password": {
          "selector": "#pass"
        },
        "submit": {
          "selector": "#login"
        }
      }
    }
  }
  // ...
}
```
```bash
hint -u userName https://example.com
```

And then have the environment variable `WEBHINT_PASSWORD` set.

**Limitations**

The new API allows a user to analyze multiple websites simulatenously. This feature will be exposed also in the CLI. With this approach there are two problems:

1. There is no way to provide different credentials to each URL
1. There is no way to perform the authentication for only certain URLs

These are edge cases and people in needs of this should use the Node.js API or re-architect their scripts to call `hint` multiple times with the right parameters in each case.

#### Node.js + `connector-chromium` API

Using the previous authentication example, the code to be executed using Puppeteer should look similar to the following:

```js
// Assume Puppeteer has already loaded the initial page

await page.type(userSelector, username);
await page.type(passSelector, password);
await page.click(submitSelector);
```

The `page.click()` action will cause a navigation in most cases. For practical purposes this navigation should be considered the initial one (the user wants to analyze the page behind the authentication, not the previous one).

The current proposal for the new Node.js API has a new Type `AnalyzeOptions` used when calling `webhint.analyze()`. A new optional property `actions(page: Puppeteer.Page): Promise<void>` should be added to it and all the other necessary `*Options` objects (`Engine` and `Connector`). A simplication of how the authentication mechanism will work in the CLI is:

```ts
const actions = async (page : Puppeteer.Page) => {
    await page.type(userSelector, username);
    await page.type(passSelector, password);
    await page.click(submitSelector);
};

const results = await webhint.analyze('https://example.com', {
    actions
});
```

From the `connector-chromium`  point of view, the `actions` property will be received in the `collect` method. If it exists it will:

1. Perform the navigation to the target
1. Start monitoring requests once the page is loaded
1. Execute `action`
1. Run the analysis on the new navigation

If `actions` does not exists in `options`, then it will run things as usual.

### `waitFor`

Right now connectors use the `waitFor` option to decide for how long (in ms) they should wait until starting the traversal and such. `Puppeteer` has [several options](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-pagegotourl-options): `timeout`, `load`, `domcontentloaded`, `networkidle0`, `networkidle2`. The same values should be accepted (although maybe not the array option).

**NOTE:** Because not all connectors will support all the values I'm not sure how the best implementation for this would be. Maybe each `connector` has its own configuration type? Something like:

```json
{
  "connector": {
    "name": "chromium",
    "options": {
     // Each connector decides its options
    }
  }
}
```

This will most likely be a **breaking** change in the connectors.

### Allow content as a target

We recently created #2149 so connectors can tell if they accept content directly or not. To support this there's [`page.setContent(html[, options])`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-pagesetcontenthtml-options).

There should not be a high usage for this feature but it seems easy enough to be supported (even if it is not on the first version).


## `connector-chromium`-`Puppeteer` API mapping

This is a (non-exhaustive) list of all the APIs to use:

| Action | API |
| ------ | --- |
| Start  | [`puppeteer.launch([options])`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-puppeteerlaunchoptions) <br> [`puppeteer.connect(options)`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-puppeteerconnectoptions)|
| JS evaluation         | [`page.evaluate(pageFunction[, ...args])`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-pageevaluatepagefunction-args) |
| Request notification  | [`page.on('request')`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-event-request) <br> [`page.on('requestfailed')`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-event-requestfailed) <br> [`page.on('requestfinished')`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-event-requestfinished) |
| Page errors | [`page.on('error)`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-event-error) <br> [`page.on('pageerror)`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-event-pageerror) (for uncaught exceptions) |
| Response notification | [`page.on('response')`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-event-response) |
| Close browser         | [`browser.close()`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-browserclose) |
| Navigate              | [`browser.newPage()`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-browsernewpage) <br> [`page.goto(url[, options])`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-pagegotourl-options) <br> [`page.waitForNavigation([options])`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-pagewaitfornavigationoptions) |
| Set page content | [`page.setContent(html[, options])`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-pagesetcontenthtml-options) |
| Input | [`page.type(selector, text[, options])`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-pagetypeselector-text-options) <br> [`page.click(selector[, options])`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-pageclickselector-options) |


## Other comments/questions

**How to run multiple pages in the same browser from different Puppeteer instances?**

The idea is to use a similar approach where the `PID` is stored in a file and alternate between [`puppeteer.launch([options])`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-puppeteerlaunchoptions) and [`puppeteer.connect(options)`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-puppeteerconnectoptions) when the browser is already running (using `browserWSEndpoint`).

**How to run a different Chromium based browser?**

[`puppeteer.launch([options])`](https://pptr.dev/#?product=Puppeteer&version=v1.14.0&show=api-puppeteerlaunchoptions) has an option to pass `executablePath`. An option should be exposed in `connector-chromium` configuration to specify it. This value could be the `path` or maybe a well-known `string` value (`chromium-canary`, `chrome`, etc.) and someone (CLI, `connetor`?) could resolve the path similar to what `chrome-launcher` does today to decide what browser to run.

Another thing to take into account is if the user starts a session with one `chromium` browser and decides to launch another session with another while it is still running. The `cdp.pid` (or whatever new file will be used) should probably contain information about the executable path to use or maybe this is an scenario that is not supported.

**Package updates**

* `chrome-connector` and `utils-debugging-protocol-common` should be deprecated and point users to download the new one.
* `configuration-*` packages should be updated to use `connector-chromium`

**Viewport**

Puppeteer's viewport default to 800x600 viewport. `null` disables the default viewport. This should be exposed in the options somehow and I think we should default to `null` in our case.

**How to get the redirects of a request**

Need to investigate more.
