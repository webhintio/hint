# Configurations

A `configuration` is a package that contains a `.sonarwhalrc` configuration
file. This makes it easier and faster for users to have `sonarwhal` up and
running and it also facilitates sharing configurations for different things
such as: related rules, urls to ignore, etc.
When installing a `configuration`, all its dependencies (`rule`s,
`connnector`s, `formatter`s, `parser`s) should be installed automatically
as well.

To use a `configuration`, you have to:

1. After installing `sonarwhal`, install a configuration package. When running
   `--init`, the wizard will list you the official configuration packages but
   you can search on `npm`. Any package `@sonarwhal/configuration-` or
   `sonarwhal-configuration-` should be a valid candidate.
2. Once installed, update your `.sonarwhalrc` to use it (this step is not needed
   if you are using the wizard):

```json
{
    "extends": ["configuration1"]
}
```

3. You are done!

The property `extends` is `Array<string>` so you can extend from multiple
configuration packages:

```json
{
    "extends": ["configuration1", "configuration2"]
}
```

The priority applies from left to right. Any values in your `.sonarwhalrc` file
will take precedence. For example, the following will always use the `summary`
formatter:

```json
{
    "extends": ["configuration1", "configuration2"],
    "formatters": ["summary"]
}
```
