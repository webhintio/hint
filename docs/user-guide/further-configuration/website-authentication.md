# Website authentication

To access an authenticated website you can use the `chrome` or `edge`
connectors. `sonarwhal` uses the browsers installed in your computer,
so if you are already authenticated `sonarwhal` can take advantage of
that and analyze that site.

There are a couple things to take into account:

* `chrome` automatically creates a new empty profile each time it is
  executed. You will have to use the `"defaultProfile": true` property
  in the `connector`’s options. You have more information in
  [the chrome configuration][chrome configuration].
* `edge` does not create a new profile, so there is no need to add any
  extra configuration. Nevertheless, `edge` works best with `sonarwhal`
  when it is the only open tab so if you can only be authenticated
  during the length of a session you might have some problems.

[chrome configuration]: ../concepts/connectors#rdc-config
