# sonarwhal's recommended web configuration (`@sonarwhal/configuration-web-recommended`)

This packages is a `sonarwhal`'s configuration package to use in production
websites.

This package will automatically install all the missing dependencies.

The minimum required `.sonarwhalrc` file to use it is the following:

```json
{
    "extends": ["web-recommended"]
}
```

and it will be as if you had this:

```json
{
    "connector": {
        "name": "jsdom",
        "options": {
            "waitFor": 5000
        }
    },
    "formatters": [
        "summary"
    ],
    "rules": {
        "apple-touch-icons": "error",
        "axe": "error",
        "content-type": "error",
        "disown-opener": "error",
        "highest-available-document-mode": "error",
        "html-checker": "error",
        "http-cache": "error",
        "http-compression": "error",
        ...
    },
    "rulesTimeout": 120000
}
```

If you prefer to use another formatter (or any other rule/connector, etc.) you
can do something like:

```json
{
    "extends": ["web-recommended"],
    "formatters": [
        "codeframe"
    ]
}
```
