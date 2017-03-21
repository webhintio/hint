# Require a web app manifest file (manifest-exists)

##  Rule Details

This rule warns against not providing a
[web app manifest](https://www.w3.org/TR/appmanifest) file.

To ensure a web app manifest file is provided, the rule basically
checks:

 * if the web app manifest file is specified correctly in the
   page (i.e. the page contains a single, valid declaration such
   as: `<link rel="manifest" href="site.webmanifest">`)

 * if the declared web app manifest file is actually accessible
   (i.e. the request doesn't result in a 404, 500, etc.)

In the context of [progressive web
apps](https://en.wikipedia.org/wiki/Progressive_web_app), this
rule is important as providing a web app manifest file is essential.

## Resources

* [Web App Manifest Specification](https://www.w3.org/TR/appmanifest)
