# 4.0.0 (May 14, 2019)

## Breaking Changes

* [[`fa1652bb1d`](https://github.com/webhintio/hint/commit/fa1652bb1d99ffc1163dcca337836d9048832ac9)] - Breaking: Validate `Connector`s configuration (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2257`](https://github.com/webhintio/hint/issues/2257)).
* [[`a01fbca4f0`](https://github.com/webhintio/hint/commit/a01fbca4f09b6de97edc698839d64910cb40f76a)] - Breaking: Move `content-type` util from `hint` to `@hint/utils` (by [`Tony Ross`](https://github.com/antross)).
* [[`f3583a2cf8`](https://github.com/webhintio/hint/commit/f3583a2cf8c8a93c0ad726803d7211f7b1383b2b)] - Breaking: Refactor DOM utils inside hint to `@hint/utils` (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2192`](https://github.com/webhintio/hint/issues/2192)).

## Bug fixes / Improvements

* [[`2dfb338234`](https://github.com/webhintio/hint/commit/2dfb3382347cd264561adc378d6c73972bd1bae6)] - Fix: Review pinned version of packages (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2025`](https://github.com/webhintio/hint/issues/2025)).
* [[`3a2357c739`](https://github.com/webhintio/hint/commit/3a2357c739c35afda338c7011f539d9fa7a6c8a1)] - Fix: Fully exit Chrome when all tabs are closed (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2197`](https://github.com/webhintio/hint/issues/2197)).
* [[`bff51557e4`](https://github.com/webhintio/hint/commit/bff51557e4fdb9bf921d3dbe60a85d897fe9abde)] - Fix: Use correct base URL in `getElementByUrl` (by [`Tony Ross`](https://github.com/antross) / see also: [`#2148`](https://github.com/webhintio/hint/issues/2148)).
* [[`fefa0bf8aa`](https://github.com/webhintio/hint/commit/fefa0bf8aa96aed556a62bf3f501e791dd9c8ece)] - Fix: Missing dependencies (by [`Antón Molleda`](https://github.com/molant)).
* [[`29b22740ad`](https://github.com/webhintio/hint/commit/29b22740ad4948d424a2072349dc8dfb7bc99134)] - Fix: Tie more elements from DOM snapshot back to original source (by [`Tony Ross`](https://github.com/antross)).
* [[`5bc0b1657f`](https://github.com/webhintio/hint/commit/5bc0b1657f024068c1479ee226dbeff3d806000a)] - Fix: Change how traversing is done and removed IAsync* references (by [`Jesus David García Gomez`](https://github.com/sarvaje)).

## New features

* [[`d934aeb9b7`](https://github.com/webhintio/hint/commit/d934aeb9b714a7ddcaf1d09a3790348eaa4c335b)] - New: Node.js API (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1532`](https://github.com/webhintio/hint/issues/1532)).
* [[`f8cbcef837`](https://github.com/webhintio/hint/commit/f8cbcef8379fa2b97c990fbfae6a74b13a4a6c8f)] - New: Add `utils` package (by [`Jesus David García Gomez`](https://github.com/sarvaje)).

## Chores

* [[`f1d392c919`](https://github.com/webhintio/hint/commit/f1d392c91988e1bdd5768568a98c72679d20c98a)] - Upgrade: Bump @types/lodash from 4.14.124 to 4.14.126 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`84dc626ff2`](https://github.com/webhintio/hint/commit/84dc626ff2f8113122d0f8bcca8ba339465cc0c4)] - Upgrade: Bump @types/lodash from 4.14.123 to 4.14.124 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`907995d47e`](https://github.com/webhintio/hint/commit/907995d47ec7dcdee2e3f336f026f9901e55f291)] - Upgrade: Bump @types/node from 11.13.9 to 12.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`8332a32710`](https://github.com/webhintio/hint/commit/8332a32710329a40a628d4e61286a0a5464fb11f)] - Upgrade: Bump @types/node from 11.13.8 to 11.13.9 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`60624562af`](https://github.com/webhintio/hint/commit/60624562af11362cf834f1791c6f3c1dfe84385d)] - Upgrade: Bump @types/node from 11.13.5 to 11.13.8 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`2075b77ab1`](https://github.com/webhintio/hint/commit/2075b77ab1b05aadc51329261df3fbc9d83cc09e)] - Upgrade: Bump typescript from 3.4.4 to 3.4.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`15aeb57f27`](https://github.com/webhintio/hint/commit/15aeb57f2753dce8e6b7c78a9cc5c5376a538835)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.6.0 to 1.7.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`7c89c54dc0`](https://github.com/webhintio/hint/commit/7c89c54dc035641db905a2d057dc2ba04af09eb1)] - Upgrade: Bump @typescript-eslint/parser from 1.6.0 to 1.7.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`b7a588d442`](https://github.com/webhintio/hint/commit/b7a588d442233484c5ffdff41865761213b4121a)] - Upgrade: Bump typescript from 3.4.3 to 3.4.4 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c119a3562d`](https://github.com/webhintio/hint/commit/c119a3562dd487b8e48f20c99ed27d37b92288a8)] - Upgrade: Bump @types/node from 11.13.4 to 11.13.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c8f87f8cb3`](https://github.com/webhintio/hint/commit/c8f87f8cb3318ef0abf1259e7a78f920c2f6701e)] - Upgrade: Bump eslint-plugin-import from 2.16.0 to 2.17.2 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`3f591e798f`](https://github.com/webhintio/hint/commit/3f591e798f352ec47bab83e53ed548318688e51a)] - Upgrade: Bump typescript from 3.3.4000 to 3.4.3 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`cf01687635`](https://github.com/webhintio/hint/commit/cf0168763549e7ac3f02d3e406bec65bd9e96eb2)] - Upgrade: Bump @types/node from 11.11.8 to 11.12.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`039f1d3a32`](https://github.com/webhintio/hint/commit/039f1d3a32b989435ef408d69bae2dd9544b8fe0)] - Upgrade: Bump @types/node from 11.11.7 to 11.11.8 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`ecae90832d`](https://github.com/webhintio/hint/commit/ecae90832d40fb4270c13395ddd35e27acf8117f)] - Upgrade: Bump @types/node from 11.11.6 to 11.11.7 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`879d4b2c59`](https://github.com/webhintio/hint/commit/879d4b2c59ff8a4a58e547639624d3efc3e3e38b)] - Chore: Scope lodash imports to reduce browser extension size (by [`Tony Ross`](https://github.com/antross)).
* [[`ae52a5e661`](https://github.com/webhintio/hint/commit/ae52a5e661ebd06ffdcd73d4cdcdc30bda62ac8d)] - Upgrade: Bump @types/node from 11.11.5 to 11.11.6 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`3f94789dca`](https://github.com/webhintio/hint/commit/3f94789dcaf69db0047858becd18e1aedf406dcd)] - Upgrade: Bump typescript from 3.3.3333 to 3.3.4000 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`4e8c353d05`](https://github.com/webhintio/hint/commit/4e8c353d05da6d2ef0e8db7b5ca8accfb0c27a16)] - Upgrade: Bump @types/node from 11.11.4 to 11.11.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c38104cdd9`](https://github.com/webhintio/hint/commit/c38104cdd92e12c1395d704a4271cfa23fb18727)] - Upgrade: Bump @types/node from 11.11.3 to 11.11.4 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`5859e56f8e`](https://github.com/webhintio/hint/commit/5859e56f8e14944a0bd130c8abeecb822622ccf3)] - Upgrade: Bump @types/node from 11.11.1 to 11.11.3 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`bb4c36429a`](https://github.com/webhintio/hint/commit/bb4c36429ac8e66c1b93525d1c6204b9b7ec8827)] - Upgrade: Bump @types/lodash from 4.14.122 to 4.14.123 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`b3f3d412b6`](https://github.com/webhintio/hint/commit/b3f3d412b603b0bf7e2e290ab3614e24acf2d277)] - Upgrade: Bump @types/node from 11.11.0 to 11.11.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`d82afffe66`](https://github.com/webhintio/hint/commit/d82afffe6668e81e6903e7a130daa07d730afb91)] - Upgrade: Bump @types/node from 11.10.5 to 11.11.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`2abf2d66f8`](https://github.com/webhintio/hint/commit/2abf2d66f8ae620edab9d1dada6eb828d4531c1c)] - Chore: Update 'hint' to 'v4.5.0' (by [`Antón Molleda`](https://github.com/molant)).
* [[`1b43c65850`](https://github.com/webhintio/hint/commit/1b43c658508043d2d77422c61d4e94af21579640)] - Upgrade: Bump @types/node from 11.10.4 to 11.10.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`752682c3fb`](https://github.com/webhintio/hint/commit/752682c3fb691c7a159928fba1c0c85075e88ecc)] - Upgrade: Bump @types/node from 11.9.5 to 11.10.4 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`e6ad75945a`](https://github.com/webhintio/hint/commit/e6ad75945a116ac822864d6561037f1de863fde4)] - Upgrade: Bump @types/lodash from 4.14.121 to 4.14.122 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`efcf80ba61`](https://github.com/webhintio/hint/commit/efcf80ba61c23c210d634c20ae85963af473606e)] - Upgrade: Bump eslint from 5.14.1 to 5.15.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`e9c11688c9`](https://github.com/webhintio/hint/commit/e9c11688c9a94d9a091e275ed847b9f5dda7ac53)] - Upgrade: Bump @typescript-eslint/parser from 1.4.0 to 1.4.2 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`e6221bf245`](https://github.com/webhintio/hint/commit/e6221bf245848bbfa6008ec1e506ad4c097ec5c2)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.4.1 to 1.4.2 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`1c7509e00a`](https://github.com/webhintio/hint/commit/1c7509e00a2d55cd04e6feb162d4e99bc0c8c101)] - Upgrade: Bump @types/node from 11.9.4 to 11.9.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`2bd6b8d1cf`](https://github.com/webhintio/hint/commit/2bd6b8d1cffec609afccc7ab0c2ca05f06d3eaab)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.4.0 to 1.4.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`6c5082f769`](https://github.com/webhintio/hint/commit/6c5082f769a3d280239d1699c185396a57edac0d)] - Upgrade: Bump typescript from 3.3.3 to 3.3.3333 (by [`Dependabot`](https://github.com/dependabot-bot)).


# 3.0.1 (February 21, 2019)

## Bug fixes / Improvements

* [[`44674e9c44`](https://github.com/webhintio/hint/commit/44674e9c4479cb3f3e3c2e66173437c74481f487)] - Fix: Refactor for file name convention (#1861) (by [`Karan Sapolia`](https://github.com/karansapolia) / see also: [`#1748`](https://github.com/webhintio/hint/issues/1748)).


# 3.0.0 (February 7, 2019)

## Breaking Changes

* [[`c069154cb3`](https://github.com/webhintio/hint/commit/c069154cb3802bb921a2fb1df64694c2263dd9ec)] - Breaking: Update 'utils-connector-tools' to 'v3.0.0' ***NO_CI*** (by [`Antón Molleda`](https://github.com/molant)).

## Bug fixes / Improvements

* [[`f6336aa8d4`](https://github.com/webhintio/hint/commit/f6336aa8d4c05baf58f66c8c6c1880a0105f7392)] - Fix: Avoid race condition on debugging protocol (by [`Antón Molleda`](https://github.com/molant)).


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
