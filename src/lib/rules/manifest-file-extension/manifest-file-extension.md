# Disallow non-standard file extension the web app manifest file (web-app-manifest-file-extension)   

##  Rule Details

This rule warns against using non-standard file extensions for the 
[web app manifest](https://www.w3.org/TR/appmanifest) file, if the 
recommended [`.webmanifest`](https://w3c.github.io/manifest/#media-type-registration)
file extension is not used.

While the `.webmanifest` file extension is not enforced by the 
specification, nor is it required by browsers, using it makes it:

  * [easier to set custom server configurations](https://github.com/w3c/manifest/issues/346) 
    for the web app manifest file
  * possible to benefit from [existing configurations](https://github.com/jshttp/mime-db/blob/67a4d013c31e73c47b5d975062f0088aea6cd5cd/src/custom-types.json#L85-L92)

## Resources

* [Web App Manifest Specification](https://www.w3.org/TR/appmanifest)
