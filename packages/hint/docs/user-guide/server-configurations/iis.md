# Basic `web.config` for IIS

The following `web.config` should be a good starting point to
pass most of `webhint`'s checks that require adding to or modifying
the server configuration.

There are some assumptions though:

* The site is static. If you are using Node.js with iisnode, ASP.NET, etc.
  you will have to add the required configuration (but most of this
  configuration should still be valid).
* All the static assets are in the folder `dist/static`.
* The static resources (CSS, JavaScript, images, etc.) have precompressed
  `gzip` and `brotli` versions. You can look into
  [IIS.Compression][IIS.Compression] if you want IIS to take care of that
  directly.
* Any URL that ends with `/` is going to serve an static HTML page that is
  already in the file system.
* The encoding of text based resources is `utf-8`.

Each section has a comment with a small explanation and the related hint:

```xml
 <!--
    Explanation
    "hint name": URL
-->
```

If you want to know more, it is recommended to visit the documentation of each
related hint.

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <system.webServer>
        <httpProtocol>
            <customHeaders>
                <!--
                    Remove unnecesary headers
                    "no-disallowed-headers": https://webhint.io/docs/user-guide/hints/hint-no-disallowed-headers
                -->
                <remove name="Expires"/>
                <remove name="Host"/>
                <remove name="P3P"/>
                <remove name="Pragma"/>
                <remove name="Public-Key-Pins"/>
                <remove name="Public-Key-Pins-Report-Only"/>
                <remove name="Via"/>
                <remove name="X-Frame-Options"/>
                <remove name="X-Powered-By"/>
                <remove name="X-Runtime"/>
                <remove name="X-Version"/>
                <!-- Security headers ("strict-transport-security") -->
                <add name="Strict-Transport-Security" value="max-age=31536000"/>
                <!--
                    Security headers ("x-content-type-options")
                    All resources must serve with this response header set to "nosniff"
                    https://webhint.io/docs/user-guide/hints/hint-x-content-type-options/
                -->
                <add name="X-Content-Type-Options" value="nosniff" />
            </customHeaders>
        </httpProtocol>
        <!--
            This removes the "Server" header on IIS 10 and later
            "no-disallowed-headers": https://webhint.io/docs/user-guide/hints/hint-no-disallowed-headers
        -->
        <security>
            <requestFiltering removeServerHeader ="true" />
        </security>

        <!--
            For the dynamic parts of the site that can't be compressed ahead of time. E.g.:
             * JSON responses from the server
             * dynamically generated html
             * ...
        -->
        <urlCompression doStaticCompression="true" doDynamicCompression="true" dynamicCompressionBeforeCache="false" />
        <staticContent>
            <!--
                Set the mimeType for all the types used in the site. IIS supports a few of
                those but they not always have the right values.

                Also set `cache-control: no-cache` by default. This will be overriden based
                on the file's path.
                See https://docs.microsoft.com/en-us/iis/configuration/system.webserver/staticcontent/clientcache
                for more info
                "content-type": https://webhint.io/docs/user-guide/hints/hint-content-type
            -->
            <clientCache cacheControlMode="DisableCache" />
            <!-- The brotli mime type is unknown to IIS, we need it or otherwise files will not be served correctly -->
            <remove fileExtension=".br" />
            <mimeMap fileExtension=".br" mimeType="application/brotli" />
            <!-- IIS doesn't set the right charset for text types -->
            <remove fileExtension=".css"/>
            <mimeMap fileExtension=".css" mimeType="text/css; charset=utf-8"/>
            <remove fileExtension=".html" />
            <mimeMap fileExtension=".html" mimeType="text/html; charset=utf-8" />
            <remove fileExtension=".js"/>
            <mimeMap fileExtension=".js" mimeType="text/javascript; charset=utf-8"/>
            <remove fileExtension=".json"/>
            <mimeMap fileExtension=".json" mimeType="application/json; charset=utf-8"/>
            <remove fileExtension=".svg"/>
            <mimeMap fileExtension=".svg" mimeType="image/svg+xml; charset=utf-8"/>
            <remove fileExtension=".txt" />
            <mimeMap fileExtension=".txt" mimeType="text/plain; charset=utf-8" />
            <remove fileExtension=".xml"/>
            <mimeMap fileExtension=".xml" mimeType="text/xml; charset=utf-8"/>
            <remove fileExtension=".webmanifest"/>
            <mimeMap fileExtension="webmanifest" mimeType="application/manifest+json; charset=utf-8"/>
            <!-- font types -->
            <remove fileExtension=".woff"/>
            <mimeMap fileExtension=".woff" mimeType="font/woff"/>
            <remove fileExtension=".woff2"/>
            <mimeMap fileExtension=".woff2" mimeType="font/woff2"/>
        </staticContent>

        <rewrite>
            <rewriteMaps>
                <!--
                    * pre-compressed files will be suffixed with br or gz
                    * map of correct mime types to be restored

                    "http-compression": https://webhint.io/docs/user-guide/hints/hint-http-compression
                -->
                <rewriteMap name="CompressedExtensions" defaultValue="">
                    <add key="css.gz" value="text/css; charset=utf-8" />
                    <add key="html.gz" value="text/html; charset=utf-8" />
                    <add key="ico.gz" value="image/x-icon" />
                    <add key="js.gz" value="text/javascript; charset=utf-8" />
                    <add key="map.gz" value="application/json; charset=utf-8" />
                    <add key="svg.gz" value="image/svg+xml; charset=utf-8" />
                    <add key="txt.gz" value="text/plain; charset=utf-8" />
                    <add key="xml.gz" value="text/xml; charset=utf-8" />
                    <add key="webmanifest.gz" value="application/manifest+json; charset=utf-8" />
                    <add key="css.br" value="text/css; charset=utf-8" />
                    <add key="html.br" value="text/html; charset=utf-8" />
                    <add key="ico.br" value="image/x-icon" />
                    <add key="js.br" value="text/javascript; charset=utf-8" />
                    <add key="map.br" value="application/json; charset=utf-8" />
                    <add key="svg.br" value="image/svg+xml; charset=utf-8" />
                    <add key="txt.br" value="text/plain; charset=utf-8" />
                    <add key="xml.br" value="text/xml; charset=utf-8" />
                    <add key="webmanifest.br" value="application/manifest+json; charset=utf-8" />
                </rewriteMap>
            </rewriteMaps>
            <outboundRules>
                <!--Restore the mime type for compressed assets. See below for more explanation ("http-compression") -->
                <rule name="RestoreMime" enabled="true">
                    <match serverVariable="RESPONSE_Content_Type" pattern=".*" />
                    <conditions>
                        <add input="{HTTP_URL}" pattern="\.((?:css|html|ico|js|map|svg|txt|xml|webmanifest)\.(gz|br))" />
                        <add input="{CompressedExtensions:{C:1}}" pattern="(.+)" />
                    </conditions>
                    <action type="Rewrite" value="{C:3}" />
                </rule>

                <!--
                    Add vary header
                    "http-compression": https://webhint.io/docs/user-guide/hints/hint-http-compression
                -->
                <rule name="AddVaryAcceptEncoding" preCondition="PreCompressedFile" enabled="true">
                    <match serverVariable="RESPONSE_Vary" pattern=".*" />
                    <action type="Rewrite" value="Accept-Encoding" />
                </rule>

                <!--
                    Indicate response is encoded with brotli
                    "http-compression": https://webhint.io/docs/user-guide/hints/hint-http-compression
                -->
                <rule name="AddEncodingBrotli" preCondition="PreCompressedBrotli" enabled="true" stopProcessing="true">
                    <match serverVariable="RESPONSE_Content_Encoding" pattern=".*" />
                    <action type="Rewrite" value="br" />
                </rule>

                <!--
                    Indicate response is encoded with gzip
                    "http-compression": https://webhint.io/docs/user-guide/hints/hint-http-compression
                -->
                <rule name="AddEncodingZopfli" preCondition="PreCompressedZopfli" enabled="true" stopProcessing="true">
                    <match serverVariable="RESPONSE_Content_Encoding" pattern=".*" />
                    <action type="Rewrite" value="gzip" />
                </rule>

                <!--
                    The preconditions to know if a file is compressed and using what algorithm
                    "http-compression": https://webhint.io/docs/user-guide/hints/hint-http-compression
                -->
                <preConditions>
                    <preCondition name="PreCompressedFile">
                        <add input="{HTTP_URL}" pattern="\.((?:css|html|ico|js|map|svg|txt|xml|webmanifest)\.(gz|br))" />
                    </preCondition>
                    <preCondition name="PreCompressedZopfli">
                        <add input="{HTTP_URL}" pattern="\.((?:css|html|ico|js|map|svg|txt|xml|webmanifest)\.gz)" />
                    </preCondition>
                    <preCondition name="PreCompressedBrotli">
                        <add input="{HTTP_URL}" pattern="\.((?:css|html|ico|js|map|svg|txt|xml|webmanifest)\.br)" />
                    </preCondition>
                </preConditions>
            </outboundRules>
            <rules>

                <!--
                    Redirect to HTTPS
                    "https-only": https://webhint.io/docs/user-guide/hints/hint-https-only
                -->
                <rule name="HTTPSRedirect" stopProcessing="true">
                    <match url="(.*)"/>
                    <conditions>
                        <add input="{HTTPS}" pattern="off" ignoreCase="true"/>
                    </conditions>
                    <action type="Redirect" url="https://{HTTP_HOST}{REQUEST_URI}" redirectType="Permanent"
                        appendQueryString="true"/>
                </rule>

                <!--
                    Compression rules. This works in combination with the `outbound rules` bellow. Basically what happens is:

                    1. Check if the user agent supprots compression via the `Accept-Encoding` header.
                    2. Prioritize `brotli` over `gzip`, and append the right extension (`.gz` or `.br`) and prepend `dist`.
                       `dist` is where all the pulic assets live. This is transparent to the user.
                       Assume all assets with those extensions have a `.gz` and `.br` version.
                       IIS then serves the asset applying the outbound rules.
                    3. If the final part of the file (`.ext.gz` or `.ext.br`) matches one of the `CompressedExtensions`
                       `rewriteMap`, rewrite the `content-type` header
                    4. Based on the extension (`.gz` or `.br`), rewrite the `content-encoding` header

                    "http-compression": https://webhint.io/docs/user-guide/hints/hint-http-compression
                -->
                <rule name="ServePrecompressedBrotli" stopProcessing="true">
                    <match url="^(.*/)?(.*?)\.(css|html|ico|js|map|svg|txt|xml|webmanifest)([?#].*)?$" ignoreCase="true"/>
                    <conditions>
                        <add input="{HTTP_ACCEPT_ENCODING}" pattern="br" negate="false" />
                    </conditions>
                    <action type="Rewrite" url="dist{REQUEST_URI}.br"/>
                </rule>
                <rule name="ServePrecompressedZopfli" stopProcessing="true">
                    <match url="^(.*/)?(.*?)\.(css|html|ico|js|map|svg|txt|xml|webmanifest)([?#].*)?$" ignoreCase="true"/>
                    <conditions>
                        <add input="{HTTP_ACCEPT_ENCODING}" pattern="gzip" negate="false"/>
                    </conditions>
                    <action type="Rewrite" url="dist{REQUEST_URI}.gz"/>
                </rule>

                <!--
                    Assume that all URLs ending in `/` point to an HTML file that exists already and have a gzip and brotli
                    compressed version as well.
                    If that is not the case delete the following "HTML" rules.
                -->
                <rule name="ServeCompressedHTMLBrotli" stopProcessing="true">
                    <match url="(^(.*\/)$|^$)" />
                    <conditions>
                        <add input="{HTTP_ACCEPT_ENCODING}" pattern="br" negate="false" />
                    </conditions>
                    <action type="Rewrite" url="dist{REQUEST_URI}index.html.br"/>
                </rule>
                <rule name="ServeCompressedHTMLZopfli" stopProcessing="true">
                    <match url="(^(.*\/)$|^$)" />
                    <conditions>
                        <add input="{HTTP_ACCEPT_ENCODING}" pattern="gzip" negate="false" />
                    </conditions>
                    <action type="Rewrite" url="dist{REQUEST_URI}index.html.gz"/>
                </rule>

                <!-- Fallback in case the user agent does a request without requesting compression  -->
                <rule name="ServeUncompressedResource">
                    <match url=".*$" ignoreCase="true"/>
                    <action type="Rewrite" url="dist{REQUEST_URI}"/>
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
    <!--
         All the static assets should be under `dist/static`, set a long cache and the `immutable` directive, overriding
         the `no-cache` set up earlier.
         "http-cache": https://webhint.io/docs/user-guide/hints/hint-http-cache
    -->
    <location path="dist/static">
        <system.webServer>
            <staticContent>
                <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" cacheControlCustom="immutable" />
            </staticContent>
        </system.webServer>
    </location>
</configuration>
```

<!-- Link labels: -->

[IIS.Compression]: https://github.com/Microsoft/IIS.Compression
