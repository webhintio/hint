# Puppeteer (`@hint/connector-puppeteer`)

A connector that uses [puppeteer][puppeteer]
to communicate with the browsers in `webhint`.

## Installation

This package is installed automatically when adding webhint to your project
so running the following is enough:

```bash
npm install hint --save-dev
```

To use it, activate it via the [`.hintrc`][hintrc] configuration file:

```json
{
    "connector": {
        "name": "puppeteer"
    },
    ...
}
```

## Options

The set of settings supported by the Puppeteer connector are:

```json
{
    "connector": {
        "name": "puppeteer",
        "options": {
            "auth": AuthObject,
            "browser": "Chrome|Chromium|Edge",
            "headless": true|false,
            "ignoreHTTPSErrors": true|false,
            "puppeteerOptions": "object",
            "waitUntil": "dom|loaded|networkidle0|networkidle2"
        }
    },
    ...
}
```

All properties of `options` are optional.

* `auth`: The credentials and elements to authenticate on a website.
  See next section for further details.
* `browser (Chrome|Chromium|Edge)`: Tells the preferred browser to
  use. If unspecified webhint will look for a `puppeteer` installation
  before falling back to searching for an installed browser and fail
  if it does not find one. Keep in mind that not all browsers are
  available on all platforms and that you need to **manually install
  either puppeteer or a browser** for this connector to work.
* `headless (boolean)`: Indicates if the browser should run in headless
  mode or not. It is `true` by default when running on CI or
  in WSL, `false` otherwise.
* `ignoreHTTPSError (boolean)`: Indicates if errors with certificates
  should be ignored. Use this when checking self-signed certificates.
  It is `false` by default.
* `puppeteerOptions (object)`: A set of launch options to pass to
  puppeteer. See the [puppeteer launch options][puppeteer launch
  options] for more information.
* `waitUntil (dom|loaded|networkidle0|networkidle2)`: Is the waiting
  strategy to decide when a page is considered loaded. See the
  [puppeteer goto options][puppeteer goto options] to know more.

### WSL support

To use this connector when running `WSL` you will have to install a chromium
browser on your distro (e.g.: `sudo apt-get install chromium-browser`).
Because by default `WSL` does not support graphics, the `headless` mode will
be enabled by default. If you have an X Server working you will have to
manually disable this option via the connector's options. E.g.:

```json
{
    "connector": {
        "name": "puppeteer",
        "options": {
            "headless": false
        }
    },
    ...
}
```

### Website authentication

The `puppeteer` connector allows to authenticate on a website that
supports Basic HTTP Authentication or:

* uses user/password (i.e.: no MFA or captcha).
* redirects to the login page and to the initial target after successful
  authentication.

For Basic Authentication the `auth` object properties are:

* `user`: a `string` with the user name to use
* `password`: a `string` with the password to use

E.g.:

```json
{
    "user": "userName",
    "password": "Passw0rd"
}
```

Otherwise, `auth` properties are:

* `user`: the information needed to identify the `input` element via
  a query `selector` (e.g.: `#login`) to type the `value` for the
  username in (e.g.: `username1`).
* `password`: the information needed to identify the `input` element via
  a query `selector` (e.g.: `#password`) to type the `value` for the
  password in (e.g.: `P@ssw0rd`).
* `next`: the information needed to identify the `input` (or `button`)
  element via a query `selector` (e.g.: `input[type="submit"]`) to `click`
  to get to the next step of the authentication process. This is an
  optional property as not all services prompt first for the user name
  before asking for the password in the following screen. An example of
  such a service would be Azure Pipelines.
* `submit`: the information needed to identify the `input` (or `button`)
  element via a query `selector` (e.g.: `input[type="submit"]`) to `click`
  to submit the crendentials.

E.g.:

```json
{
    "user": {
        "selector": "string",
        "value": "string"
    },
    "password": {
        "selector": "string",
        "value": "string"
    },
    "next": {
        "selector": "string"
    },
    "submit": {
        "selector": "string"
    }
}
```

### User actions

Sometimes you might need the browser to interact in some way with the
content before starting the analysis. For example, in the case of
a SPA you might want to click in certain elements to get to the right
state.

Sometimes, this actions need to be done before navigating to the page
to analyze.

To achieve this, you can use "user actions". "User actions" are
defined as follows:

```json
{
    "connector": {
        "name": "puppeteer",
        "options": {
            "actions": [
                {
                    "file": "pathToUserAction1.js",
                    "on": "beforeTargetNavigation|afterTargetNavigation"
                },
                {
                    "file": "pathToUserAction2.js",
                    "on": "beforeTargetNavigation|afterTargetNavigation"
                },
                ...
            ],
            "actionsOptions": { },
            ...
        }
    },
    ...
}
```

There's a property `actions` in the connector configuration that's an array
of `Action`. You can define as many actions as you want.

An `Action` is an object with two properties:

* `file`: Absolute or relative path from the execution path to the file
  containing the action to execute.
* `on`: A string that indicates when the action needs to be executed:
  * `beforeTargetNavigation`: The action will be executed before navigating
    to the target. If you need to set up special headers you will have to
    do it at this moment.
  * `afterTargetNavigation`: The action will be executed after the target
    has been loaded. If the website is a SPA and you need to get to a certain
    state, this is the moment to use.

The file that contains the action needs to be written in JavaScript and export
an object with an `action` property with the following signature:

```js
module.exports = {
    action: async (page, options) => {
        // your actions here
    }
};
```

The parameters the function receives are:

* `page`: The [puppeteer `Page`][puppeteer page] with the tab used to navigate
  to the target. This gives you full control to do anything you need with the
  page (click, type, navigate elsewhere, etc.).
* `options`: The connector options. This allows you access to `waitFor` values
  and any other user configuration. If you need to pass anything specifically
  to the actions you can use `options.actionOptions` property to do so.

#### User action examples

The connector's authentication mechanisms rely on the user actions API.
The following is the code for the Basic HTTP Auth (transpiled to JS):

```js
module.exports = {
    action: async (page, config) => {
        if (!config || !config.auth) {
            return;
        }

        if (typeof config.auth.user !== 'string' || typeof config.auth.password !== 'string') {
            return;
        }

        await page.authenticate({
            password: config.auth.password,
            username: config.auth.user
        });
    }
};
```

**Note:** This user action uses `options.auth` which is already
predefined. If your user action needs another type of user information you can
use `options.actionsOptions`.

The following is an example of a user action that will click on an element
configured via `options.actionsOptions`:

```json
{
    "connector": {
        "name": "puppeteer",
        "options": {
            "actions": [
                {
                    "file": "clickElement.js",
                    "on": "afterTargetNavigation"
                }
            ],
            "actionsOptions": {
                "elementId": "#id"
            }
        }
    },
    ...
}
```

```js
module.exports = {
    action: async (page, config) => {
        const selector = config.actionsOptions.elementId;

        await page.click(selector);
    }
};
```

Please look at the source code of `connector-puppeteer` for other built-in
actions.

## Further Reading

* [Connectors][connectors]
* [Puppeteer documentation][puppeteer]

<!-- Link labels: -->

[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[puppeteer]: https://pptr.dev/
[puppeteer goto options]: https://pptr.dev/#?product=Puppeteer&version=master&show=api-pagegotourl-options
[puppeteer launch options]: https://pptr.dev/#?product=Puppeteer&version=master&show=api-puppeteerlaunchoptions
[puppeteer page]: https://pptr.dev/#?product=Puppeteer&version=v1.20.0&show=api-class-page
