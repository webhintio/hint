# Architecture

This hint groups 4 different sub-hints:

* Hint for deprecated CSS features.
* Hint for not broadly supported CSS features.
* Hint for deprecated HTML features.
* Hint for not broadly supported HTML features.

It relies on the data from [`browser-compat-data`][browser-compat-data] to
know if a [CSS][browser-compat-data-css] or [HTML][browser-compat-data-html]
feature is supported or deprecated.

## CLI Flow

Every single hint takes [`the provided browserlist by the user (or the default
one)`][browser-context] and the hint context to filter the list of features to
test.

Once the previous step is done, the parser exposes sequentially all the features
included in the resource (CSS or HTML). The hint then tests each feature as it is
exposed, as long as it is not in the `ignore` built-in list. All the errors
reported are temporarily stored and consumed once the `scan::end` event is
obtained.

[![Compat API hint's architecture][architecture]][architecture]

As explained above, the errors are not reported when detected, they are stored
and refined before being **reported**. The flow of finding and reporting errors
in this hint differs greatly from the rest of the hints.

Reporting accurate errors for CSS is an interesting problem that can produce
false possitives if not done carefully. For example, it is possible to find an
scenario where the developer is using a feature never implemented or deprecated
with the standard name and with the vendor prefixes.

An example would be [-webkit-box-lines and box-lines][mdn-box-lines]. The hint
could potentially report an error for each one of them when, in fact, it is
enough to report an error for the non-prefixed version of the feature and thus
avoid any unnecessary noise.

To achieve this, we store all the potential errors found. If, at the end there
are multiple errors for the same feature only the ones related to the feature
name are reported, discarding the prefixed ones.

[![Class inheritance diagram][class-inheritance-diagram]][class-inheritance-diagram]

<!-- Link labels: -->

[browser-compat-data]: https://github.com/mdn/browser-compat-data
[browser-compat-data-css]: https://github.com/mdn/browser-compat-data/tree/master/css
[browser-compat-data-html]: https://github.com/mdn/browser-compat-data/tree/master/html
[browser-context]: https://webhint.io/docs/user-guide/configuring-webhint/browser-context
[mdn-box-lines]: https://developer.mozilla.org/en-US/docs/Web/CSS/box-lines
[architecture]: images/architecture.png
[class-inheritance-diagram]: images/uml.png
