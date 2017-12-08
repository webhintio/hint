# .sonarwhalrc formats

The `.sonarwhalrc` file supports the different file formats:

```json
{
    "connector": {
        "name": "connectorName"
    },
    "formatters": ["formatterName"],
    "rules": {
        "rule1": "error",
        "rule2": "warning",
        "rule3": "off"
    },
    "rulesTimeout": 120000
}
```
