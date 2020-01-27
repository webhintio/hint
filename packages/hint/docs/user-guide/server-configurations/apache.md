# Basic server configuration for Apache

The following configurations should be a good starting point to
pass most of `webhint`'s checks that require adding to or modifying
the server configuration.

There are some assumptions though:

* The below snippet works with Apache `v2.2.0+`, but you need to have
  [`mod_deflate`][mod_deflate], [`mod_expires`][mod_expires],
  [`mod_headers`][mod_headers], [`mod_mime`][mod_mime],
  [`mod_rewrite`][mod_rewrite], and for Apache versions below `v2.3.7`
  [`mod_filter`][mod_filter] [enabled][how to enable apache modules]
  for it to take effect.

* If you have access to the [main Apache configuration file][main
  apache conf file] (usually called `httpd.conf`), you should add
  the logic in, for example, a [`<Directory>`][apache directory]
  section in that file. This is usually the recommended way as
  [using `.htaccess` files slows down][htaccess is slow] Apache!

  If you don't have access to the main configuration file (quite
  common with hosting services), add the snippets in a `.htaccess`
  file in the root of the web site/app.

```apache
# ######################################################################
# # MEDIA TYPES AND CHARACTER ENCODINGS (content-type)                 #
# ######################################################################

# ----------------------------------------------------------------------
# | Media types                                                        |
# ----------------------------------------------------------------------

# Serve resources with the proper media types (f.k.a. MIME types).
# https://webhint.io/docs/user-guide/hints/hint-content-type/

<IfModule mod_mime.c>

  # Data interchange

    # 2.2.x+

    AddType text/xml                                    xml

    # 2.2.x - 2.4.x

    AddType application/json                            json
    AddType application/rss+xml                         rss

    # 2.4.x+

    AddType application/json                            map

  # JavaScript

    # 2.2.x+

    # See: https://html.spec.whatwg.org/multipage/scripting.html#scriptingLanguages.
    AddType text/javascript                             js mjs


  # Manifest files

    # 2.2.x+

    AddType application/manifest+json                   webmanifest
    AddType text/cache-manifest                         appcache


  # Media files

    # 2.2.x - 2.4.x

    AddType audio/mp4                                   f4a f4b m4a
    AddType audio/ogg                                   oga ogg spx
    AddType video/mp4                                   mp4 mp4v mpg4
    AddType video/ogg                                   ogv
    AddType video/webm                                  webm
    AddType video/x-flv                                 flv

    # 2.2.x+

    AddType image/svg+xml                               svgz
    AddType image/x-icon                                cur

    # 2.4.x+

    AddType image/webp                                  webp


  # Web fonts

    # 2.2.x - 2.4.x

    AddType application/vnd.ms-fontobject               eot

    # 2.2.x+

    AddType font/woff                                   woff
    AddType font/woff2                                  woff2
    AddType font/ttf                                    ttf
    AddType font/collection                             ttc
    AddType font/otf                                    otf


  # Other

    # 2.2.x+

    AddType text/vtt                                    vtt

</IfModule>

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# Serve all resources labeled as `text/html` or `text/plain`
# with the media type `charset` parameter set to `utf-8`.
#
# https://httpd.apache.org/docs/current/mod/core.html#adddefaultcharset

AddDefaultCharset utf-8

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# Serve the following file types with the media type `charset`
# parameter set to `utf-8`.
#
# https://httpd.apache.org/docs/current/mod/mod_mime.html#addcharset

<IfModule mod_mime.c>
    AddCharset utf-8 .appcache \
                     .atom \
                     .css \
                     .js \
                     .json \
                     .manifest \
                     .map \
                     .mjs \
                     .rdf \
                     .rss \
                     .vtt \
                     .webmanifest \
                     .xml
</IfModule>


# ######################################################################
# # Compression (http-compression)                                     #
# ######################################################################

# Server resources compressed.
# https://webhint.io/docs/user-guide/hints/hint-http-compression/

# [!] The following relies on Apache being configured to have
#     the correct filename extensions to media types mappings
#     (see `content-type` section).
#
# [!] For Zopfli and Brotli this snippet assumes that running
#     the build step will result in 3 version for every resource:
#
#     * the original (e.g.: script.js) - this file should exists
#       in case the user agent doesn’t requests things compressed
#     * the file compressed with Zopfli (e.g.: script.js.gz)
#     * the file compressed with Brotli (e.g.: script.js.br)

<IfModule mod_headers.c>
    <IfModule mod_rewrite.c>

        # Turn on the rewrite engine (this is necessary in order for
        # the `RewriteRule` directives to work).
        #
        # https://httpd.apache.org/docs/current/mod/core.html#options

        RewriteEngine On

        # Enable the `FollowSymLinks` option if it isn't already.
        #
        # https://httpd.apache.org/docs/current/mod/core.html#options

        Options +FollowSymlinks

        # If the web host doesn't allow the `FollowSymlinks` option,
        # it needs to be comment out or removed, and then the following
        # uncomment, but be aware of the performance impact.
        #
        # https://httpd.apache.org/docs/current/misc/perf-tuning.html#symlinks

        # Options +SymLinksIfOwnerMatch

        # Depending on how the server is set up, you may also need to
        # use the `RewriteOptions` directive to enable some options for
        # the rewrite engine.
        #
        # https://httpd.apache.org/docs/current/mod/mod_rewrite.html#rewriteoptions

        # RewriteBase /

        # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        # 1) Brotli

            # If `Accept-Encoding` header contains `br`

            RewriteCond "%{HTTP:Accept-encoding}" "br"

            # and the request is made over HTTPS.

            RewriteCond "%{HTTPS}" "on"

            # The Brotli pre-compressed version of the file exists
            # (e.g.: `script.js` is requested and `script.js.gz` exists).

            RewriteCond "%{REQUEST_FILENAME}\.br" "-s"

            # Then, serve the Brotli pre-compressed version of the file.

            RewriteRule "^(.*)" "$1\.br" [QSA]

            # Set the correct media type of the requested file. Otherwise,
            # it will be served with the br media type since the file has
            # the `.br` extension.
            #
            # Also, set the special purpose environment variables so
            # that Apache doesn't recompress these files.

            RewriteRule "\.(ico|cur)\.br$"      "-" [T=image/x-icon,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.(md|markdown)\.br$"  "-" [T=text/markdown,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.appcache\.br$"       "-" [T=text/cache-manifest,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.atom\.br$"           "-" [T=application/atom+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.bmp\.br$"            "-" [T=image/bmp,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.css\.br$"            "-" [T=text/css,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.eot.\.br$"           "-" [T=application/vnd.ms-fontobject,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.geojson\.br$"        "-" [T=application/vnd.geo+json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.html?\.br$"          "-" [T=text/html,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.ics\.br$"            "-" [T=text/calendar,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.json\.br$"           "-" [T=application/json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.jsonld\.br$"         "-" [T=application/ld+json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.m?js\.br$"           "-" [T=text/javascript,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.otf\.br$"            "-" [T=font/otf,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.rdf\.br$"            "-" [T=application/rdf+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.rss\.br$"            "-" [T=application/rss+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.svg\.br$"            "-" [T=image/svg+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.ttc\.br$"            "-" [T=font/collection,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.ttf\.br$"            "-" [T=font/ttf,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.txt\.br$"            "-" [T=text/plain,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.vc(f|ard)\.br$"      "-" [T=text/vcard,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.vtt\.br$"            "-" [T=text/vtt,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.webmanifest\.br$"    "-" [T=application/manifest+json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.xhtml\.br$"          "-" [T=application/xhtml+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.xml\.br$"            "-" [T=text/xml,E=no-brotli:1,E=no-gzip:1]

            # Set the `Content-Encoding` header.

            <FilesMatch "\.br$">
                Header append Content-Encoding br
            </FilesMatch>

        # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        # 2) Zopfli

            # If `Accept-Encoding` header contains `gzip` and the
            # request is made over HTTP.

            RewriteCond "%{HTTP:Accept-encoding}" "gzip"

            # The Zopfli pre-compressed version of the file exists
            # (e.g.: `script.js` is requested and `script.js.gz` exists).

            RewriteCond "%{REQUEST_FILENAME}\.gz" "-s"

            # Then serve the Zopfli pre-compressed version of the file.

            RewriteRule "^(.*)" "$1\.gz" [QSA]

            # Set the media types of the file, as otherwise, because
            # the file has the `.gz` extension, it wil be served with
            # the gzip media type.
            #
            # Also, set the special purpose environment variables so
            # that Apache doesn't recompress these files.

            RewriteRule "\.(ico|cur)\.gz$"      "-" [T=image/x-icon,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.(md|markdown)\.gz$"  "-" [T=text/markdown,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.appcache\.gz$"       "-" [T=text/cache-manifest,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.atom\.gz$"           "-" [T=application/atom+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.bmp\.gz$"            "-" [T=image/bmp,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.css\.gz$"            "-" [T=text/css,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.eot.\.gz$"           "-" [T=application/vnd.ms-fontobject,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.geojson\.gz$"        "-" [T=application/vnd.geo+json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.html?\.gz$"          "-" [T=text/html,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.ics\.gz$"            "-" [T=text/calendar,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.json\.gz$"           "-" [T=application/json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.jsonld\.gz$"         "-" [T=application/ld+json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.m?js\.gz$"           "-" [T=text/javascript,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.otf\.gz$"            "-" [T=font/otf,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.rdf\.gz$"            "-" [T=application/rdf+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.rss\.gz$"            "-" [T=application/rss+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.svg\.gz$"            "-" [T=image/svg+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.ttc\.gz$"            "-" [T=font/collection,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.ttf\.gz$"            "-" [T=font/ttf,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.txt\.gz$"            "-" [T=text/plain,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.vc(f|ard)\.gz$"      "-" [T=text/vcard,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.vtt\.gz$"            "-" [T=text/vtt,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.webmanifest\.gz$"    "-" [T=application/manifest+json,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.xhtml\.gz$"          "-" [T=application/xhtml+xml,E=no-brotli:1,E=no-gzip:1]
            RewriteRule "\.xml\.gz$"            "-" [T=text/xml,E=no-brotli:1,E=no-gzip:1]

            # Set the `Content-Encoding` header.

            <FilesMatch "\.gz$">
                Header append Content-Encoding gzip
            </FilesMatch>

        # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        # Set the `Vary` header.

        <FilesMatch "\.(br|gz)$">
            Header append Vary Accept-Encoding
        </FilesMatch>

    </IfModule>
</IfModule>

<IfModule mod_deflate.c>

    # 3) gzip
    #
    # [!] For Apache versions below version 2.3.7 you don't need to
    # enable `mod_filter` and can remove the `<IfModule mod_filter.c>`
    # and `</IfModule>` lines as `AddOutputFilterByType` is still in
    # the core directives.
    #
    # https://httpd.apache.org/docs/current/mod/mod_filter.html#addoutputfilterbytype

    <IfModule mod_filter.c>
        AddOutputFilterByType DEFLATE "application/atom+xml" \
                                      "application/json" \
                                      "application/manifest+json" \
                                      "application/rdf+xml" \
                                      "application/rss+xml" \
                                      "application/schema+json" \
                                      "application/vnd.ms-fontobject" \
                                      "application/xhtml+xml" \
                                      "font/collection" \
                                      "font/opentype" \
                                      "font/otf" \
                                      "font/ttf" \
                                      "image/bmp" \
                                      "image/svg+xml" \
                                      "image/x-icon" \
                                      "text/cache-manifest" \
                                      "text/css" \
                                      "text/html" \
                                      "text/javascript" \
                                      "text/plain" \
                                      "text/vtt" \
                                      "text/xml"
    </IfModule>

    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    # Special case: SVGZ
    #
    # If these files type would be served without the
    # `Content-Enable: gzip` response header, user agents would
    # not know that they first need to uncompress the response,
    # and thus, wouldn't be able to understand the content.

    <IfModule mod_mime.c>
        AddEncoding gzip              svgz
    </IfModule>

</IfModule>


# ######################################################################
# # Caching (http-cache)                                               #
# ######################################################################

# Serve resources with far-future expiration date.
# https://webhint.io/docs/user-guide/hints/hint-http-cache/

# [!] The following relies on Apache being configured to have
#     the correct filename extensions to media types mappings
#     (see apache `content-type` section).
#
# [!] Do not use or comment out the following if you are not
#     using filename/path-based revving.

<IfModule mod_expires.c>

  # Automatically add the `Cache-Control` header (as well as the
  # equivalent `Expires` header).

    ExpiresActive on

  # By default, inform user agents to cache all resources for 1 year.

    ExpiresDefault                                   "access plus 1 year"


  # Overwrite the previous for file types whose content usually changes
  # very often, and thus, should not be cached for such a long period,
  # or at all.

    # AppCache manifest files

        ExpiresByType text/cache-manifest            "access plus 0 seconds"


    # /favicon.ico (cannot be renamed!)

        # [!] If you have access to the main Apache configuration
        #     file, you can match the root favicon exactly using the
        #     `<Location>` directive. The same cannot be done inside
        #     of a `.htaccess` file where only the `<Files>` directive
        #     can be used, reason why the best that can be done is match
        #     all files named `favicon.ico` (but that should work fine
        #     if filename/path-based revving is used)
        #
        # See also: https://httpd.apache.org/docs/current/sections.html#file-and-web.

        <Files "favicon.ico">
            ExpiresByType image/x-icon               "access plus 1 hour"
        </Files>


    # Data interchange

        ExpiresByType application/atom+xml           "access plus 1 hour"
        ExpiresByType application/rdf+xml            "access plus 1 hour"
        ExpiresByType application/rss+xml            "access plus 1 hour"

        ExpiresByType application/json               "access plus 0 seconds"
        ExpiresByType application/ld+json            "access plus 0 seconds"
        ExpiresByType application/schema+json        "access plus 0 seconds"
        ExpiresByType application/vnd.geo+json       "access plus 0 seconds"
        ExpiresByType text/xml                       "access plus 0 seconds"


    # HTML

        ExpiresByType text/html                      "access plus 0 seconds"


    # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    # Where needed add `immutable` value to the `Cache-Control` header

    <IfModule mod_headers.c>

        # Because `mod_headers` cannot match based on the content-type,
        # the following workaround needs to be done.

        # 1) Add the `immutable` value to the `Cache-Control` header
        #    to all resources.

        Header merge Cache-Control immutable

        # 2) Remove the value for all resources that shouldn't be have it.

        <FilesMatch "\.(appcache|cur|geojson|ico|json(ld)?|x?html?|topojson|xml)$">
            Header edit Cache-Control immutable ""
        </FilesMatch>

    </IfModule>

</IfModule>


# ######################################################################
# # DOCUMENT MODES (highest-available-document-mode)                   #
# ######################################################################

# Force Internet Explorer 8/9/10 to render pages in the highest mode
# available in the various cases when it may not.
#
# https://webhint.io/docs/user-guide/hints/hint-highest-available-document-mode/

<IfModule mod_headers.c>

    # Because `mod_headers` cannot match based on the content-type,
    # and the `X-UA-Compatible` response header should only be sent
    # for HTML documents and not for the other resources, the following
    # workaround needs to be done.

    # 1) Add the header to all resources.

    Header set X-UA-Compatible "IE=edge"

    # 2) Remove the header for all resources that should not have it.

    <FilesMatch "\.(appcache|atom|bbaw|bmp|crx|css|cur|eot|f4[abpv]|flv|geojson|gif|htc|ic[os]|jpe?g|m?js|json(ld)?|m4[av]|manifest|map|markdown|md|mp4|oex|og[agv]|opus|otf|pdf|png|rdf|rss|safariextz|svgz?|swf|topojson|tt[cf]|txt|vcard|vcf|vtt|webapp|web[mp]|webmanifest|woff2?|xloc|xml|xpi)$">
        Header unset X-UA-Compatible
    </FilesMatch>

</IfModule>

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# If the `X-UA-Compatible` header is not needed, remove or comment
# out the section above. If it's still added from somewhere in the
# stack (e.g. the framework level, language level such as PHP, etc.),
# and that cannot be changed, the following may be used to remove it
# at the Apache level.

# <IfModule mod_headers.c>
#     Header unset X-UA-Compatible
# </IfModule>


# ######################################################################
# # SECURITY                                                           #
# ######################################################################

# ----------------------------------------------------------------------
# | HTTP Strict Transport Security (strict-transport-security)         |
# ----------------------------------------------------------------------

# Serve resources with the Strict-Transport-Security header.
# https://webhint.io/docs/user-guide/hints/hint-strict-transport-security/
#
# [!] Uncomment the following if the site supports HTTPS.

# <IfModule mod_headers.c>
#     Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
# </IfModule>

# ----------------------------------------------------------------------
# | X-Content-Type-Options                                             |
# ----------------------------------------------------------------------

# Serve resources with the x-content-type-options header set to `nosniff`.
# https://webhint.io/docs/user-guide/hints/hint-x-content-type-options/

# <IfModule mod_headers.c>
#     Header always set X-Content-Type-Options nosniff
# </IfModule>


# ######################################################################
# # Unnedded / Disallowed headers                                      #
# ######################################################################

# ----------------------------------------------------------------------
# | HTML only headers (no-html-only-headers)                            |
# ----------------------------------------------------------------------

# Do not send HTML only headers for non-HTML resources,
# https://webhint.io/docs/user-guide/hints/hint-no-html-only-headers/#page-heading

<IfModule mod_headers.c>

    # Because `mod_headers` cannot match based on the content-type,
    # the following workaround needs to be used.

    <FilesMatch "\.(appcache|atom|bbaw|bmp|crx|css|cur|eot|f4[abpv]|flv|geojson|gif|htc|ic[os]|jpe?g|m?js|json(ld)?|m4[av]|manifest|map|markdown|md|mp4|oex|og[agv]|opus|otf|pdf|png|rdf|rss|safariextz|svgz?|swf|topojson|tt[cf]|txt|vcard|vcf|vtt|webapp|web[mp]|webmanifest|woff2?|xloc|xml|xpi)$">
        Header unset Content-Security-Policy
        Header unset X-Content-Security-Policy
        Header unset X-Frame-Options
        Header unset X-UA-Compatible
        Header unset X-WebKit-CSP
        Header unset X-XSS-Protection
    </FilesMatch>
</IfModule>

# ----------------------------------------------------------------------
# | Disallowed headers (no-disallowed-headers)                         |
# ----------------------------------------------------------------------

# Remove unneeded headers.
# https://webhint.io/docs/user-guide/hints/hint-no-disallowed-headers/

# If the headers are sent, in most cases, to make Apache stop sending
# them requires removing the configurations that tells Apache to add
# them (e.g. for the `X-UA-Compatible` header, that would be mean
# removing something such as `Header set X-UA-Compatible "IE=edge"`).
# However, if the headers are added from somewhere in the stack (e.g.:
# the framework level, language level such as PHP, etc.), and that
# cannot be changed, you can try to remove them at the Apache level,
# using the following.

<IfModule mod_headers.c>
    Header unset P3P
    Header unset Public-Key-Pins
    Header unset Public-Key-Pins-Report-Only
    Header unset X-AspNet-Version
    Header unset X-AspNetMvc-version
    Header unset X-Powered-By
    Header unset X-Runtime
    Header unset X-Version
</IfModule>

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# Prevent Apache from sending in the `Server` response header its
# exact version number, the description of the generic OS-type or
# information about its compiled-in modules.
#
# https://httpd.apache.org/docs/current/mod/core.html#servertokens

# [!] The following will only work in the main Apache configuration
#     file, so do not uncomment the following if this is include it
#     in a .htaccess file!

# ServerTokens Prod


# ######################################################################
# # Custom configurations                                              #
# ######################################################################

# Add here your custom configurations.

```

<!-- Link labels: -->

[apache directory]: https://httpd.apache.org/docs/current/mod/core.html#directory
[how to enable apache modules]: https://github.com/h5bp/server-configs-apache/tree/7eb30da6a06ec4fc24daf33c75b7bd86f9ad1f68#enable-apache-httpd-modules
[htaccess is slow]: https://httpd.apache.org/docs/current/howto/htaccess.html#when
[main apache conf file]: https://httpd.apache.org/docs/current/configuring.html#main
[mod_deflate]: https://httpd.apache.org/docs/current/mod/mod_deflate.html
[mod_expires]: https://httpd.apache.org/docs/current/mod/mod_expires.html
[mod_filter]: https://httpd.apache.org/docs/current/mod/mod_filter.html
[mod_headers]: https://httpd.apache.org/docs/current/mod/mod_headers.html
[mod_mime]: https://httpd.apache.org/docs/current/mod/mod_mime.html
[mod_rewrite]: https://httpd.apache.org/docs/current/mod/mod_rewrite.html
