# 2.0.2 (January 15, 2019)

## Bug fixes / Improvements

* [[`a19fe95a35`](https://github.com/webhintio/hint/commit/a19fe95a35c6a44411d1f24c06dbbd6b782a7904)] - Fix: Manifest parser runs twice (by [`Jesus David García Gomez`](https://github.com/sarvaje)).


# 2.0.1 (December 31, 2018)

## Bug fixes / Improvements

* [[`c412f9aa7b`](https://github.com/webhintio/hint/commit/c412f9aa7ba99eb7ef6c20b7c496d629530f3ecf)] - Docs: Fix reference links and remove `markdownlint-cli` dependency (#1566) (by [`Antón Molleda`](https://github.com/molant)).


# 2.0.0 (November 5, 2018)

## Breaking Changes

* [[`dfd635d74e`](https://github.com/webhintio/hint/commit/dfd635d74e0858ac2b7fe9e2ffc6e75a4e6b8578)] - Breaking: Update `utils-connector-tools` to `v2.0.0` [skip ci] (by [`Cătălin Mariș`](https://github.com/alrra)).
* [[`59e5b9ade4`](https://github.com/webhintio/hint/commit/59e5b9ade47698d9bae42106cd93606a451b5a56)] - Breaking: Update `hint` to `v4.0.0` [skip ci] (by [`Cătălin Mariș`](https://github.com/alrra)).
* [[`d181168807`](https://github.com/webhintio/hint/commit/d18116880733897793628f0a8e829de941531d18)] - Breaking: Use typed event registration and dispatch (by [`Tony Ross`](https://github.com/antross) / see also: [`#123`](https://github.com/webhintio/hint/issues/123)).


# 1.0.14 (October 25, 2018)

## Bug fixes / Improvements

* [[`548474dfc1`](https://github.com/webhintio/hint/commit/548474dfc191a1a6e28b21a56ea19dd9017939d1)] - Fix: Prevent CDP connector from failing because of `decodeURIComponent` (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1449`](https://github.com/webhintio/hint/issues/1449)).


# 1.0.13 (October 19, 2018)

## Bug fixes / Improvements

* [[`5d8a804c03`](https://github.com/webhintio/hint/commit/5d8a804c0344a0a10991ff81488fcbc0b700c0da)] - Fix: Refactor debugging protocol (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1398`](https://github.com/webhintio/hint/issues/1398), [`#1403`](https://github.com/webhintio/hint/issues/1403), and [`#1409`](https://github.com/webhintio/hint/issues/1409)).


# 1.0.12 (October 10, 2018)

## Bug fixes / Improvements

* [[`d04e94b7de`](https://github.com/webhintio/hint/commit/d04e94b7dee1ccd3f7c6d9cc7af545f06a40e9b5)] - Fix: Add timeout waiting for a request to finish (by [`Jesus David García Gomez`](https://github.com/sarvaje)).


# 1.0.11 (October 2, 2018)

## Bug fixes / Improvements

* [[`cf0200bbb0`](https://github.com/webhintio/hint/commit/cf0200bbb02827e6ff0a35daa7799117c99b7ae3)] - Fix: Assume target is `html` if the media type is `unknown` or `xml` (by [`Antón Molleda`](https://github.com/molant)).


# 1.0.10 (September 28, 2018)

## Bug fixes / Improvements

* [[`c88fe2e7e3`](https://github.com/webhintio/hint/commit/c88fe2e7e36ba11ab6d7387c119e0818762173a1)] - Fix: Prevent downloading the favicon twice (see also: [`#1352`](https://github.com/webhintio/hint/issues/1352)).
* [[`19faf7fb69`](https://github.com/webhintio/hint/commit/19faf7fb69d1e82f5e5a543f88f0a07289f5eb4b)] - Fix: Make `_dom` fully loaded when assigned (by [`Antón Molleda`](https://github.com/molant)).


# 1.0.9 (September 27, 2018)

## Bug fixes / Improvements

* [[`04768493c1`](https://github.com/webhintio/hint/commit/04768493c1e14eddfd4c11f142b7cd4d4f93c9b0)] - Fix: Stop listening to network request after `waitFor` (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1350`](https://github.com/webhintio/hint/issues/1350)).


# 1.0.8 (September 24, 2018)

## Bug fixes / Improvements

* [[`3a43352cff`](https://github.com/webhintio/hint/commit/3a43352cffc9f48eed7c6454792e577db7ef8daa)] - Fix: Truncated body in some circumstances (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1325`](https://github.com/webhintio/hint/issues/1325)).
* [[`33a8639be4`](https://github.com/webhintio/hint/commit/33a8639be47e72fbb55b6d04ae54107c38e68dfb)] - Fix: Convert `base64` text based responses to text (by [`Antón Molleda`](https://github.com/molant)).


# 1.0.7 (September 23, 2018)

## Bug fixes / Improvements

* [[`85496fe75f`](https://github.com/webhintio/hint/commit/85496fe75f0ec9995a6bded7058881cedca556eb)] - Fix: Revert "Fix: Several issues with the Debugging Protocol" (by [`Cătălin Mariș`](https://github.com/alrra)).


# 1.0.6 (September 20, 2018)

## Bug fixes / Improvements

* [[`ea56a95ce4`](https://github.com/webhintio/hint/commit/ea56a95ce452c136c872dadd9c790b2cc5f9cd06)] - Fix: Several issues with the Debugging Protocol (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1325`](https://github.com/webhintio/hint/issues/1325)).


# 1.0.5 (September 20, 2018)

## Bug fixes / Improvements

* [[`537bbbbd98`](https://github.com/webhintio/hint/commit/537bbbbd98c2269d95ecda08e54aa4a086468183)] - Fix: Use JSDOM locations for elements if available (by [`Tony Ross`](https://github.com/antross)).


# 1.0.4 (September 11, 2018)

## Bug fixes / Improvements

* [[`1f94752647`](https://github.com/webhintio/hint/commit/1f94752647ba7f023ca47931351b3995567d890e)] - Fix: Normalize evaluate error messages and make them more user friendly (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1303`](https://github.com/webhintio/hint/issues/1303)).


# 1.0.3 (September 6, 2018)

## Bug fixes / Improvements

* [[`7cde2e145d`](https://github.com/webhintio/hint/commit/7cde2e145d247ea2dd0a42cbf2aa3a601b223a88)] - Fix: Make `npm` package not include `npm-shrinkwrap.json` file (by [`Cătălin Mariș`](https://github.com/alrra) / see also: [`#1294`](https://github.com/webhintio/hint/issues/1294)).


# 1.0.2 (August 27, 2018)

## Bug fixes / Improvements

* [[`9b88e39019`](https://github.com/webhintio/hint/commit/9b88e390193b2181453e6d1065cc2d112c85a169)] - Fix: Make `hint` a `devDependency` (by [`Cătălin Mariș`](https://github.com/alrra)).


# 1.0.1 (August 27, 2018)

## Bug fixes / Improvements

* [[`ff1e2d4504`](https://github.com/webhintio/hint/commit/ff1e2d4504e9d916edbf36b5a2a8caa368af31ff)] - Fix: Undefined `this` in method `rawResponse` (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1252`](https://github.com/webhintio/hint/issues/1252)).


# 1.0.0 (August 6, 2018)

✨
