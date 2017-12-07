# Ignoring domains

Sometimes you don’t have control over all the infrastructure and there
is nothing you can do about it. Reporting errors in those cases just
generates noise and frustration. Instead of globally disabling a rule
you might just want to turn it off for a domain, or directly ignore
completely one (like a third party analytics, ads, etc.). To achieve
this you need to add the `ignoredUrls` property to your `.sonarwhalrc` file:

```json
"ignoredUrls": [{
    "domain": ".*\\.domain1\\.com/.*",
    "rules": ["*"]
}, {
    "domain": "www.domain2.net",
    "rules": ["disallowed-headers"]
}]
```

Properties can be:

* regular expressions, like `.*\\.domain1\\.com/.*`. This will match:
  * `something.domain1.com/index.html`
  * `somethingelse.domain1.com/image.png`
* some text, like `www.domain2.net`. In this case, if the resource URL
  contains the text, it will be a match. E.g.:
  * `www.domain2.net/index.php`
  * `www.domain2.net/image.png`

The value of the property has to be an array of strings where the
strings can be:

* `*` if you want to ignore all rules for the given domain.
* The ID of the rule to be ignored.

In the previous example we will:

* Ignore all rules for any resource that matches the regex
  `.*\\.domain1\\.com/.*`.
* Ignore the rule `disallowed-headers` for the domain `www.domain2.net`.
