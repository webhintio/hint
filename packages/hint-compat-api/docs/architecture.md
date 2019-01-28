# Architecture

This hint groups 4 different hints:

* Hint for deprecated CSS features.
* Hint for not broadly supported CSS features.
* Hint for deprecated HTML features.
* Hint for not broadly supported HTML features.

It relies on the data from https://github.com/mdn/browser-compat-data to
know the status of CSS and HTML features:

* CSS: https://github.com/mdn/browser-compat-data/tree/master/css
* HTML: https://github.com/mdn/browser-compat-data/tree/master/html

## CLI Flow

Every single hint takes the provided browserlist by the user (or the default
one) and the hint context to filter the list of features to test. 

Once the previous step is done, the parser exposes sequentially all the features
included in the resource (CSS or HTML) and it proceeds to test the feature if
needed and not included in the `ignore` built-in list. All the errors reported 
are temporary stored and consumed once the `scan::end` event is obtained.