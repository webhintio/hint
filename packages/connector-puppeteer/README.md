# Puppeteer (`@hint/connector-puppeteer`)

A connector that uses [puppeteer][puppeteer]
to communicate with the browsers in `webhint`.

## Installation

First, you need to install [`webhint`](https://webhint.io/):

```bash
npm install hint
```

Then, install the new connector:

```bash
npm install @hint/connector-puppeteer
```

## Usage

Configure the connector name in your [`.hintrc`][hintrc]
configuration file:

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
            "auth": {
                "user": {
                    "selector": "string",
                    "value": "string"
                },
                "password": {
                    "selector": "string",
                    "value": "string"
                },
                "submit": {
                    "selector": "string"
                }
            },
            "ignoreHTTPSErrors": true|false,
            "waitUntil": "dom|loaded|networkidle0|networkidle2"
        }
    },
    ...
}
```

### Website authentication

The `puppeteer` connector allows to authenticate on a website that:

* uses user/password (i.e.: no MFA or captcha).
* the website needs to redirect to the login page and to the initial
  target after successful authentication.

The properties of `auth` are:

* `user`: the information needed to identify the `input` element via
  a query `selector` (e.g.: `#login`) to type the `value` for the
  username in (e.g.: `username1`).
* `password`: the information needed to identify the `input` element via
  a query `selector` (e.g.: `#password`) to type the `value` for the
  password in (e.g.: `P@ssw0rd`).
* `submit`: the information needed to identify the `input` (or `button`)
  element via a query `selector` (e.g.: `input[type="submit"]`) to `click`
  to submit the crendentials.

## Further Reading

* [Connectors][connectors]

<!-- Link labels: -->

[connectors]: https://webhint.io/docs/user-guide/concepts/connectors/
[hintrc]: https://webhint.io/docs/user-guide/configuring-webhint/summary/
[puppeteer]: https://pptr.dev/
