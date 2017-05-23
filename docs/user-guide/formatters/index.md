# Formatters

The current supported `formatter`s are:

* `json`: Will do a `JSON.stringify()` of the results so the output
  will not be user friendly:

   ```text
   $ sonar example.com

   http://example.com/
   Warning  Disallowed HTTP header found: server                                       disallowed-headers
   Warning  http://example.com/ doesn't support HTTPS.                                 ssllabs
   Warning  Resource served without the 'X-Content-Type-Options' HTTP response header  x-content-type-options
   Warning  Response does not include the 'X-UA-Compatible' header                     highest-available-document-mode
   Warning  Web app manifest not specified                                             manifest-exists
   Warning  Charset meta tag should be the first thing in '<head>'                     meta-charset-utf-8
   Warning  <html> element must have a lang attribute                                  axe
   Warning  A charset meta tag was already specified                                   meta-charset-utf-8
   ✖ Found 0 errors and 8 warnings

   ✖ Found a total of 0 errors and 8 warnings
   Exit code: 0
   ```

* `stylish`:

   ```text
   $ sonar example.com

   http://example.com/: 8 issues
   [
     {
       "column": -1,
       "line": -1,
       "message": "Disallowed HTTP header found: server",
       "resource": "http://example.com/",
       "ruleId": "disallowed-headers",
       "severity": 1
     },
     {
       "column": -1,
       "line": -1,
       "message": "http://example.com/ doesn't support HTTPS.",
       "resource": "http://example.com/",
       "ruleId": "ssllabs",
       "severity": 1
     },
     {
       "column": -1,
       "line": -1,
       "message": "Resource served without the 'X-Content-Type-Options' HTTP response header",
       "resource": "http://example.com/",
       "ruleId": "x-content-type-options",
       "severity": 1
     },
     {
       "column": -1,
       "line": -1,
       "message": "Response does not include the 'X-UA-Compatible' header",
       "resource": "http://example.com/",
       "ruleId": "highest-available-document-mode",
       "severity": 1
     },
     {
       "column": -1,
       "line": -1,
       "message": "Web app manifest not specified",
       "resource": "http://example.com/",
       "ruleId": "manifest-exists",
       "severity": 1
     },
     {
       "column": -1,
       "line": -1,
       "message": "Charset meta tag should be the first thing in '<head>'",
       "resource": "http://example.com/",
       "ruleId": "meta-charset-utf-8",
       "severity": 1
     },
     {
       "column": -1,
       "line": -1,
       "message": "<html> element must have a lang attribute",
       "resource": "http://example.com/",
       "ruleId": "axe",
       "severity": 1
     },
     {
       "column": -1,
       "line": -1,
       "message": "A charset meta tag was already specified",
       "resource": "http://example.com/",
       "ruleId": "meta-charset-utf-8",
       "severity": 1
     }
   ]
   Exit code: 0
   ```
