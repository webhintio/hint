# Image optimization with Cloudinary (`image-optimization-cloudinary`)

`image-optimization-cloudinary` uses the [Cloudinary][cloudinary]
service to analyze your images and see if there could be size savings
on them.

**Note:** To use this rule you will need to have an account in this
service and configure it to use those credentials via the
[`CLOUDINARY_URL` environment variable][environment-variable] or in
the rule’s configuration. You can create a [free account here][signup].

## Why is this important?

As of September 15th 2017, and based on [HTTP Archive][httparchive-report],
images account for a bit over 53% of the size of a website in average,
or 1,810kB.

!["Average Bytes per Page by Content Type"][bytes-per-content-type]

By having your images optimized, you will help your users have a better
and faster experience when navigating in your website.

## What does the rule check?

This rule will use Cloudinary’s infrastructure to upload any images
found and check if they can be optimized maintaining the same resolution
and format.

## Can the rule be configured?

Yes, if you don’t want to use the `CLOUDINARY_URL` environment variable
to set up your credentials, you can do the following:

```json
"image-optimization-cloudinary": ["error", {
    "apiKey": "your api key",
    "apiSecret": "your api secret",
    "cloudName": "your cloud name"
}]
```

By default, this rule will notify you even if there is just 1kB savings.
If you want to change the `threshold` you can do it like this:

```json
"image-optimization-cloudinary": ["error", {
    "threshold": 10
}]
```

The `threshold` value will be used for the savings per image, and the
total possible savings.

### Examples that **trigger** the rule

* Having an image that Cloudinary can optimize further.
* Having a `threshold` configured and an image whose savings is equal
  or greater than the configured value.
* Having a `threshold` configured and several images whose individual
  savings is less than `threshold` but when combined it’s greater. For
  example, if you configure a `threshold` of 10, and you have one image
  that could be 6kB smaller, and another one that could be 5kB smaller,
  this rule will report an issue because the combined savings is greater
  than 10.

### Examples that **pass** the rule

* Having all your images optimized.
* Having a `threshold` configured and the combined savings of all images
  smaller to that value.

## Further Reading

* [Cloudinary][cloudinary]
* [Images comprise 62% of a page’s total weight][62percent]

[62percent]: https://www.soasta.com/blog/page-bloat-average-web-page-2-mb/
[bytes-per-content-type]: https://chart.googleapis.com/chart?chs=400x225&cht=p&chco=007099&chd=t:1810,52,89,454,109,789,16&chds=0,1810&chdlp=b&chdl=total%203376%20kB&chl=Images+-+1810+kB%7CHTML+-+52+kB%7CStylesheets+-+89+kB%7CScripts+-+454+kB%7CFonts+-+109+kB%7CVideo+-+789+kB%7COther+-+16+kB&chma=|5&chtt=Average+Bytes+per+Page+by+Content+Type
[cloudinary]: https://cloudinary.com
[environment-variable]: https://www.npmjs.com/package/cloudinary#configuration
[httparchive-report]: http://httparchive.org/interesting.php?a=All&l=Sep%2015%202017#bytesperpage
[signup]: https://cloudinary.com/users/register/free
