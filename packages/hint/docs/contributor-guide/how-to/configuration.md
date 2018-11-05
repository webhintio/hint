# Create a custom shareable configuration

If you use `webhint` in multiple projects you might want to share the same
configuration with all of them. An easy way to achieve this is via shareable
configurations.

The `webhint` team currently maintains a few of these packages:

* [`web-recommended`][configuration-web-recommended]
* [`development`][configuration-development]

To use them you install one (or more) in your project using npmn and `extend`
them:

```bash
npm install --save-dev `@hint/configuration-web-recommended`
```

And in your `.hintrc` add:

```json
{
    "extends": ["web-recommended"]
}
```

One interesting thing that can be done with shared configurations is to download
all the required `connector`s, `formatter`s, `hint`s, and `parser`s at the same
time they get installed. This way you can guarantee that all dependencies are
satisfied and there are no configuration issues.

## Quick example

A shareable configuration npm package contains (at least) the following:

* `package.json`: All the required dependencies you want to get installed
  automatically for this `configuration`.
* `index.json`: A `json` with the same format as a regular `.hintrc` file with
  the configuration to be shared.

In order for `webhint` to find the package the name has to be:

* `@hint/configuration-NAME` if it is maintained officially by the `webhint`
  team (you will not be able to publish to the `@hint` scope unless you have the
  right privileges).
* `hint-configuration-NAME` if it is not.

Imagine you want to create a configuration that focuses only in security. First
you will create a new package in an empty folder:

```bash
mkdir hint-configuration-security
cd hint-configuration-security
npm init
```

Answer all the questions from the wizard making sure to:

* Set `index.json` as the entry point.
* Set the package name to `hint-configuration-security`.

Once this is done, add all the security hints you are interested in:

```bash
npm install --save-dev @hint/disown-opener @hint/https-only @hint/no-disallowed-headers ...
```

Do not forget to add a `connector` and a `formatter`. `jsdom` and `html` are the
examples in this case:

```bash
npm install --save-dev @hint/connector-jsdom @hint/formatter-html
```

Finally, create a new `index.json` in the root of the project with a content
similar to:

```json
{
    "connector": "jsdom",
    "formatters": ["html"],
    "hints": {
        "disown-opener": "error",
        "https-only": "error",
        "no-disallowed-headers": "error",
        ...
    }
}
```

The package should be ready for publishing now and you can do it via `npm
publish`. There is more detailed information about this command in [npm's
publish documentation][npm publish].

To consume it you install it as follows in all the projects you want to use it:

```bash
npm install hint-configuration-security
```

And create a `.hintrc` file in each one with this:

```json
{
    "extends": ["configuration-security"]
}
```

<!-- Link labels -->

[configuration-web-recommended]: https://npmjs.com/package/@hint/configuration-web-recommended
[configuration-development]: https://www.npmjs.com/package/@hint/configuration-development
[npm publish]: https://docs.npmjs.com/cli/publish
