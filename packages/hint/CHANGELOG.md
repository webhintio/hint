# 4.0.0 (November 5, 2018)

## Breaking Changes

* [[`0e82bcad9b`](https://github.com/webhintio/hint/commit/0e82bcad9bd5fb3626bf68d94278b89d685b46c7)] - Breaking: Change `context.report` to take an `options` object (by [`Tony Ross`](https://github.com/antross) / see also: [`#1415`](https://github.com/webhintio/hint/issues/1415)).
* [[`8499d5ca65`](https://github.com/webhintio/hint/commit/8499d5ca6519d859d81d5126cfd9886bee5d3091)] - Breaking: Rename `parse::*::end`, etc. to `parse::end::*` (by [`Tony Ross`](https://github.com/antross) / see also: [`#1397`](https://github.com/webhintio/hint/issues/1397)).
* [[`d181168807`](https://github.com/webhintio/hint/commit/d18116880733897793628f0a8e829de941531d18)] - Breaking: Use typed event registration and dispatch (by [`Tony Ross`](https://github.com/antross) / see also: [`#123`](https://github.com/webhintio/hint/issues/123)).

## Bug fixes / Improvements

* [[`306a3829af`](https://github.com/webhintio/hint/commit/306a3829af9e268cee36eaf1bf3be745894b001e)] - Docs: Add `Create a custom shareable configuration` (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1442`](https://github.com/webhintio/hint/issues/1442)).
* [[`a64e60f6bc`](https://github.com/webhintio/hint/commit/a64e60f6bc60705d7e6b3a92d323d554bfbb105c)] - Fix: Make `target` optional for `formatter` calls (by [`Tony Ross`](https://github.com/antross)).


# 3.4.14 (October 31, 2018)

## Bug fixes / Improvements

* [[`a88fc0963b`](https://github.com/webhintio/hint/commit/a88fc0963b93fe832f0f94e3a6d44b06749d25c2)] - Docs: Fix links to `parser`s (by [`Antón Molleda`](https://github.com/molant)).
* [[`3c81bfb673`](https://github.com/webhintio/hint/commit/3c81bfb673dff06d518dcd829e9df793f33b342a)] - Docs: Update broken links (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1459`](https://github.com/webhintio/hint/issues/1459)).


# 3.4.13 (October 25, 2018)

## Bug fixes / Improvements

* [[`b4cc570391`](https://github.com/webhintio/hint/commit/b4cc570391484ef189d0d28a2f9d0fa7d4339c6e)] - Docs: Update `Architecture` section (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1406`](https://github.com/webhintio/hint/issues/1406)).


# 3.4.12 (October 24, 2018)

## Bug fixes / Improvements

* [[`8ad451642b`](https://github.com/webhintio/hint/commit/8ad451642bd60d858cfcfe72b9ba99c14134a7d4)] - Docs: Rename top level entries to `summary.md` (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1435`](https://github.com/webhintio/hint/issues/1435)).
* [[`e0d397ee56`](https://github.com/webhintio/hint/commit/e0d397ee56e9661f8c97d5e63edad1d9fa668c4c)] - Docs: Update content to latest changes (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1128`](https://github.com/webhintio/hint/issues/1128)).
* [[`84a880cfa9`](https://github.com/webhintio/hint/commit/84a880cfa942e05b0affb1978a538046089142a3)] - Docs: Add information about `local` connector (by [`Antón Molleda`](https://github.com/molant)).
* [[`87d3fcee7c`](https://github.com/webhintio/hint/commit/87d3fcee7c87bc3342b890b4d09674cd96b3f6e7)] - Docs: Update `parser` documentation (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1045`](https://github.com/webhintio/hint/issues/1045)).
* [[`a05e45bce1`](https://github.com/webhintio/hint/commit/a05e45bce1bad3b5b571bf3f1d05c3c9a98c8223)] - Docs: Improve documentation around `.hintrc` (by [`Antón Molleda`](https://github.com/molant) / see also: [`#884`](https://github.com/webhintio/hint/issues/884), and [`#1174`](https://github.com/webhintio/hint/issues/1174)).


# 3.4.11 (October 19, 2018)

## Bug fixes / Improvements

* [[`5d8a804c03`](https://github.com/webhintio/hint/commit/5d8a804c0344a0a10991ff81488fcbc0b700c0da)] - Fix: Refactor debugging protocol (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1398`](https://github.com/webhintio/hint/issues/1398), [`#1403`](https://github.com/webhintio/hint/issues/1403), and [`#1409`](https://github.com/webhintio/hint/issues/1409)).
* [[`59d19a76d8`](https://github.com/webhintio/hint/commit/59d19a76d88387ca1eaa76710b94ff6c625a693b)] - Docs: Fix links (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1418`](https://github.com/webhintio/hint/issues/1418)).


# 3.4.10 (October 10, 2018)

## Bug fixes / Improvements

* [[`f300d048d0`](https://github.com/webhintio/hint/commit/f300d048d0f6ac685045a13cfb13fd2197d0a67f)] - Fix: Selector for attributes with namespace (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1388`](https://github.com/webhintio/hint/issues/1388)).
* [[`d04e94b7de`](https://github.com/webhintio/hint/commit/d04e94b7dee1ccd3f7c6d9cc7af545f06a40e9b5)] - Fix: Add timeout waiting for a request to finish (by [`Jesus David García Gomez`](https://github.com/sarvaje)).
* [[`9b8eacf23b`](https://github.com/webhintio/hint/commit/9b8eacf23bc37919eaf260fb317eb48ed0a37ea2)] - Docs: Add documentation for the `local` connector (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1245`](https://github.com/webhintio/hint/issues/1245)).


# 3.4.9 (October 9, 2018)

## Bug fixes / Improvements

* [[`c6f9203f94`](https://github.com/webhintio/hint/commit/c6f9203f9443420d17ea508e7d8337604b4d48a6)] - Fix: User `date` on HTML formatter (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1386`](https://github.com/webhintio/hint/issues/1386)).


# 3.4.8 (October 3, 2018)

## Bug fixes / Improvements

* [[`aa52c565c0`](https://github.com/webhintio/hint/commit/aa52c565c09ba941eea0ae5d4fbb7015588439d1)] - Fix: Add new HTML formatter design (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1326`](https://github.com/webhintio/hint/issues/1326)).


# 3.4.7 (October 3, 2018)

## Bug fixes / Improvements

* [[`f825d2027c`](https://github.com/webhintio/hint/commit/f825d2027c1d8ba687dc46f66c1062c2109dc35c)] - Fix: Update `jsdom` to `v12.1.0` (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#163`](https://github.com/webhintio/hint/issues/163), [`#1223`](https://github.com/webhintio/hint/issues/1223), and [`#1357`](https://github.com/webhintio/hint/issues/1357)).


# 3.4.6 (October 1, 2018)

## Bug fixes / Improvements

* [[`27b16cd988`](https://github.com/webhintio/hint/commit/27b16cd988387f9d645acf8305afd0d383446c82)] - Fix: Use the right scope for third party code (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1358`](https://github.com/webhintio/hint/issues/1358)).


# 3.4.5 (September 27, 2018)

## Bug fixes / Improvements

* [[`85a48a78d2`](https://github.com/webhintio/hint/commit/85a48a78d2e0593c62e9087face4b2f9c395ebc9)] - Docs: Update information about `waitFor` option (by [`Antón Molleda`](https://github.com/molant)).


# 3.4.4 (September 26, 2018)

## Bug fixes / Improvements

* [[`da7cb4903f`](https://github.com/webhintio/hint/commit/da7cb4903ffd9b36c644d87046598604b2555669)] - Docs: Normalize links (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1344`](https://github.com/webhintio/hint/issues/1344)).


# 3.4.3 (September 24, 2018)

## Bug fixes / Improvements

* [[`8d1e8b79e0`](https://github.com/webhintio/hint/commit/8d1e8b79e03d5826e46f654e5a8fee83a5f184f9)] - Fix: Location issues with `jsdom` (by [`Antón Molleda`](https://github.com/molant)).


# 3.4.2 (September 20, 2018)

## Bug fixes / Improvements

* [[`537bbbbd98`](https://github.com/webhintio/hint/commit/537bbbbd98c2269d95ecda08e54aa4a086468183)] - Fix: Use JSDOM locations for elements if available (by [`Tony Ross`](https://github.com/antross)).


# 3.4.1 (September 19, 2018)

## Bug fixes / Improvements

* [[`046932e55f`](https://github.com/webhintio/hint/commit/046932e55f35525f450a58121315cb408dc16549)] - Docs: Mention `windows-build-tools` in User Guide (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1320`](https://github.com/webhintio/hint/issues/1320), and [`#1322`](https://github.com/webhintio/hint/issues/1322)).
* [[`b26255d4a1`](https://github.com/webhintio/hint/commit/b26255d4a1c1778f6a943f0e94d72b018146ed83)] - Docs: Add missing default configuration (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1319`](https://github.com/webhintio/hint/issues/1319)).


# 3.4.0 (September 11, 2018)

## New features

* [[`0766455f1c`](https://github.com/webhintio/hint/commit/0766455f1c0ff9e4cfae7f8f6d2a57c661fae9c1)] - New: Add location (line/column) information for JSON (by [`Tony Ross`](https://github.com/antross) / see also: [`#1297`](https://github.com/webhintio/hint/issues/1297)).


# 3.3.2 (September 6, 2018)

## Bug fixes / Improvements

* [[`7cde2e145d`](https://github.com/webhintio/hint/commit/7cde2e145d247ea2dd0a42cbf2aa3a601b223a88)] - Fix: Make `npm` package not include `npm-shrinkwrap.json` file (by [`Cătălin Mariș`](https://github.com/alrra) / see also: [`#1294`](https://github.com/webhintio/hint/issues/1294)).


# 3.3.1 (September 5, 2018)

## Bug fixes / Improvements

* [[`0bd677b2b3`](https://github.com/webhintio/hint/commit/0bd677b2b3f708184a6ba47f794f84f9a2a0f773)] - Docs: Use `hint` instead of `webhint` in install instructions (by [`Cătălin Mariș`](https://github.com/alrra)).


# 3.3.0 (September 5, 2018)

## Bug fixes / Improvements

* [[`43a06a9c1f`](https://github.com/webhintio/hint/commit/43a06a9c1f8dee62f6261e085217c941fa3d853c)] - Fix: Issue with `summary` formatter always being used (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1273`](https://github.com/webhintio/hint/issues/1273)).

## New features

* [[`a7ca732234`](https://github.com/webhintio/hint/commit/a7ca73223489b8705250db0fe6ad33e5c7b344a9)] - New: Add standalone `parser-html` (by [`Tony Ross`](https://github.com/antross) / see also: [`#1277`](https://github.com/webhintio/hint/issues/1277)).


# 3.2.5 (August 28, 2018)

## Bug fixes / Improvements

* [[`5d85d15e45`](https://github.com/webhintio/hint/commit/5d85d15e45c3df365cc8582e8d86df32ae8527d4)] - Fix: Allow to pass content directly to things such as local connector (by [`Tony Ross`](https://github.com/antross) / see also: [`#1268`](https://github.com/webhintio/hint/issues/1268)).


# 3.2.4 (August 28, 2018)

## Bug fixes / Improvements

* [[`ea3ae22f24`](https://github.com/webhintio/hint/commit/ea3ae22f24d06693f0429232f7b35c1d199e763f)] - Fix: Remove duplicate values when extending config (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1273`](https://github.com/webhintio/hint/issues/1273)).


# 3.2.3 (August 22, 2018)

## Bug fixes / Improvements

* [[`1acc771321`](https://github.com/webhintio/hint/commit/1acc771321a2a83fc525e6743109982c85e40c0f)] - Fix: Revert back to using `mime-db` v1.35.0 (by [`Cătălin Mariș`](https://github.com/alrra) / see also: [`#1250`](https://github.com/webhintio/hint/issues/1250)).


# 3.2.2 (August 21, 2018)

## Bug fixes / Improvements

* [[`5aae7afb7a`](https://github.com/webhintio/hint/commit/5aae7afb7a12b36cf72fe7882acddbfeb184b9ce)] - Fix: Update `User-Agent` string (by [`Cătălin Mariș`](https://github.com/alrra)).
* [[`95013b787e`](https://github.com/webhintio/hint/commit/95013b787ec4e7045238c7e2ace82a04b483377d)] - Docs: Add information about the `formatter-html` (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1242`](https://github.com/webhintio/hint/issues/1242)).


# 3.2.1 (August 17, 2018)

## Bug fixes / Improvements

* [[`47f0829b05`](https://github.com/webhintio/hint/commit/47f0829b0582943b0df996bd8da24f218a3ed812)] - Docs: Add Travis CI + Azure Web App integration information (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1238`](https://github.com/webhintio/hint/issues/1238)).


# 3.2.0 (August 14, 2018)

## New features

* [[`a3a53154c5`](https://github.com/webhintio/hint/commit/a3a53154c5098ed1e811c081e2198813972079b9)] - New: Update `configuration-web-recommended` to `v1.1.0` (by [`Cătălin Mariș`](https://github.com/alrra)).


# 3.1.1 (August 14, 2018)

## Bug fixes / Improvements

* [[`8d1caf359a`](https://github.com/webhintio/hint/commit/8d1caf359ade37604059a0330c746b14efa5fff6)] - Fix: Format of event in AppInsights (by [`Antón Molleda`](https://github.com/molant)).
* [[`830badad76`](https://github.com/webhintio/hint/commit/830badad76b4117d32cc2f69bc166d47c9b3d6c4)] - Docs: Add full Apache configuration example (by [`Cătălin Mariș`](https://github.com/alrra) / see also: [`#1100`](https://github.com/webhintio/hint/issues/1100)).


# 3.1.0 (August 10, 2018)

## Bug fixes / Improvements

* [[`02d2c6ad88`](https://github.com/webhintio/hint/commit/02d2c6ad8841a1bc8a9a61340a941363fed534bc)] - Docs: Fix typo (by [`Lim Chee Aun`](https://github.com/cheeaun) / see also: [`#1227`](https://github.com/webhintio/hint/issues/1227)).
* [[`4ac86c3110`](https://github.com/webhintio/hint/commit/4ac86c3110efea9cd9fcf4219f28e802b56af95b)] - Docs: Add full `web.config` example (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1224`](https://github.com/webhintio/hint/issues/1224)).

## New features

* [[`2f3d1a0176`](https://github.com/webhintio/hint/commit/2f3d1a017694bd904daa8e418165343e8e33f922)] - New: Add category to report messages, and new options to formatters (by [`Jesus David García Gomez`](https://github.com/sarvaje)).


# 3.0.1 (August 7, 2018)

## Bug fixes / Improvements

* [[`68ddc908f8`](https://github.com/webhintio/hint/commit/68ddc908f8f198641df5b3b2dd74ae2c1897b913)] - Docs: Update references to `--init` (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1215`](https://github.com/webhintio/hint/issues/1215)).


# 3.0.0 (August 6, 2018)

✨
