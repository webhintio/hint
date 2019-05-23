# 3.1.0 (May 23, 2019)

## New features

* [[`bbce68a7e2`](https://github.com/webhintio/hint/commit/bbce68a7e2fa2131f8e4cc0a57814581e27491fd)] - New: Connector `puppeteer` (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2248`](https://github.com/webhintio/hint/issues/2248), and [`#2419`](https://github.com/webhintio/hint/issues/2419)).

## Chores

* [[`313cce5742`](https://github.com/webhintio/hint/commit/313cce5742c8d6ff855aafe563c72b8e9b7bfb5f)] - Chore: Repurpose `test-release` script (by [`Antón Molleda`](https://github.com/molant)).
* [[`aab9913543`](https://github.com/webhintio/hint/commit/aab9913543d9a09fc8ccb0e0c7dc8b2f2ee35ed6)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.7.0 to 1.9.0 (by [`Dependabot`](https://github.com/dependabot-bot)).


# 3.0.0 (May 14, 2019)

## Breaking Changes

* [[`f3583a2cf8`](https://github.com/webhintio/hint/commit/f3583a2cf8c8a93c0ad726803d7211f7b1383b2b)] - Breaking: Refactor DOM utils inside hint to `@hint/utils` (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2192`](https://github.com/webhintio/hint/issues/2192)).

## Bug fixes / Improvements

* [[`0726e63af2`](https://github.com/webhintio/hint/commit/0726e63af23da7ddd33bafe35c55bb88b00d2a3a)] - Fix: Migrate to new `isSupported` utility based on MDN data (by [`Tony Ross`](https://github.com/antross)).
* [[`2dfb338234`](https://github.com/webhintio/hint/commit/2dfb3382347cd264561adc378d6c73972bd1bae6)] - Fix: Review pinned version of packages (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2025`](https://github.com/webhintio/hint/issues/2025)).
* [[`fefa0bf8aa`](https://github.com/webhintio/hint/commit/fefa0bf8aa96aed556a62bf3f501e791dd9c8ece)] - Fix: Missing dependencies (by [`Antón Molleda`](https://github.com/molant)).
* [[`ebee647206`](https://github.com/webhintio/hint/commit/ebee6472061a5a16a2392e787adbdaefad2de6de)] - Fix: Use getters for innerHTML and outerHTML (by [`Tony Ross`](https://github.com/antross)).
* [[`36a8fab7be`](https://github.com/webhintio/hint/commit/36a8fab7be8978bd92b302a2de9b5a9b0bf26e2c)] - Fix: Update IAsync* references to use HTMLDocument/HTMLElement (by [`Jesus David García Gomez`](https://github.com/sarvaje)).

## New features

* [[`f8cbcef837`](https://github.com/webhintio/hint/commit/f8cbcef8379fa2b97c990fbfae6a74b13a4a6c8f)] - New: Add `utils` package (by [`Jesus David García Gomez`](https://github.com/sarvaje)).

## Chores

* [[`0994c8857e`](https://github.com/webhintio/hint/commit/0994c8857eef2fea3c7d89ef3ec8ca354565979f)] - Chore: Fix docs linting issues (by [`Antón Molleda`](https://github.com/molant)).
* [[`907995d47e`](https://github.com/webhintio/hint/commit/907995d47ec7dcdee2e3f336f026f9901e55f291)] - Upgrade: Bump @types/node from 11.13.9 to 12.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`0f70f6f773`](https://github.com/webhintio/hint/commit/0f70f6f773235cdab31d5811eaa5f0ff9be9650f)] - Upgrade: Bump nyc from 14.0.0 to 14.1.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`8332a32710`](https://github.com/webhintio/hint/commit/8332a32710329a40a628d4e61286a0a5464fb11f)] - Upgrade: Bump @types/node from 11.13.8 to 11.13.9 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`60624562af`](https://github.com/webhintio/hint/commit/60624562af11362cf834f1791c6f3c1dfe84385d)] - Upgrade: Bump @types/node from 11.13.5 to 11.13.8 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`2075b77ab1`](https://github.com/webhintio/hint/commit/2075b77ab1b05aadc51329261df3fbc9d83cc09e)] - Upgrade: Bump typescript from 3.4.4 to 3.4.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`15aeb57f27`](https://github.com/webhintio/hint/commit/15aeb57f2753dce8e6b7c78a9cc5c5376a538835)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.6.0 to 1.7.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`7c89c54dc0`](https://github.com/webhintio/hint/commit/7c89c54dc035641db905a2d057dc2ba04af09eb1)] - Upgrade: Bump @typescript-eslint/parser from 1.6.0 to 1.7.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`b7a588d442`](https://github.com/webhintio/hint/commit/b7a588d442233484c5ffdff41865761213b4121a)] - Upgrade: Bump typescript from 3.4.3 to 3.4.4 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c119a3562d`](https://github.com/webhintio/hint/commit/c119a3562dd487b8e48f20c99ed27d37b92288a8)] - Upgrade: Bump @types/node from 11.13.4 to 11.13.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c8f87f8cb3`](https://github.com/webhintio/hint/commit/c8f87f8cb3318ef0abf1259e7a78f920c2f6701e)] - Upgrade: Bump eslint-plugin-import from 2.16.0 to 2.17.2 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`83510aecf9`](https://github.com/webhintio/hint/commit/83510aecf9657aadbc987ae7ad66603a1da1e8e0)] - Upgrade: Bump nyc from 13.3.0 to 14.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`3f591e798f`](https://github.com/webhintio/hint/commit/3f591e798f352ec47bab83e53ed548318688e51a)] - Upgrade: Bump typescript from 3.3.4000 to 3.4.3 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`f50942e1ac`](https://github.com/webhintio/hint/commit/f50942e1ac6658f9e4b333f7f3a7342ab98b48ea)] - Upgrade: Bump ava from 1.4.0 to 1.4.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c8eb30606a`](https://github.com/webhintio/hint/commit/c8eb30606a39c9175e1ec43a8d693d04ff5842d4)] - Upgrade: Bump ava from 1.3.1 to 1.4.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`3f94789dca`](https://github.com/webhintio/hint/commit/3f94789dcaf69db0047858becd18e1aedf406dcd)] - Upgrade: Bump typescript from 3.3.3333 to 3.3.4000 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`2abf2d66f8`](https://github.com/webhintio/hint/commit/2abf2d66f8ae620edab9d1dada6eb828d4531c1c)] - Chore: Update 'hint' to 'v4.5.0' (by [`Antón Molleda`](https://github.com/molant)).
* [[`4a14448fdb`](https://github.com/webhintio/hint/commit/4a14448fdbebf96599548e49e4c8bca2fc0f05f8)] - Upgrade: Bump ava from 1.2.1 to 1.3.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`efcf80ba61`](https://github.com/webhintio/hint/commit/efcf80ba61c23c210d634c20ae85963af473606e)] - Upgrade: Bump eslint from 5.14.1 to 5.15.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`e9c11688c9`](https://github.com/webhintio/hint/commit/e9c11688c9a94d9a091e275ed847b9f5dda7ac53)] - Upgrade: Bump @typescript-eslint/parser from 1.4.0 to 1.4.2 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`e6221bf245`](https://github.com/webhintio/hint/commit/e6221bf245848bbfa6008ec1e506ad4c097ec5c2)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.4.1 to 1.4.2 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`2bd6b8d1cf`](https://github.com/webhintio/hint/commit/2bd6b8d1cffec609afccc7ab0c2ca05f06d3eaab)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.4.0 to 1.4.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`6c5082f769`](https://github.com/webhintio/hint/commit/6c5082f769a3d280239d1699c185396a57edac0d)] - Upgrade: Bump typescript from 3.3.3 to 3.3.3333 (by [`Dependabot`](https://github.com/dependabot-bot)).


# 2.1.2 (February 21, 2019)

## Bug fixes / Improvements

* [[`44674e9c44`](https://github.com/webhintio/hint/commit/44674e9c4479cb3f3e3c2e66173437c74481f487)] - Fix: Refactor for file name convention (#1861) (by [`Karan Sapolia`](https://github.com/karansapolia) / see also: [`#1748`](https://github.com/webhintio/hint/issues/1748)).


# 2.1.1 (January 2, 2019)

## Bug fixes / Improvements

* [[`1fb8024b57`](https://github.com/webhintio/hint/commit/1fb8024b57f94552303258ab31b11d8d6de8a415)] - Docs: Fix some links (by [`Jesus David García Gomez`](https://github.com/sarvaje)).
* [[`c412f9aa7b`](https://github.com/webhintio/hint/commit/c412f9aa7ba99eb7ef6c20b7c496d629530f3ecf)] - Docs: Fix reference links and remove `markdownlint-cli` dependency (#1566) (by [`Antón Molleda`](https://github.com/molant)).


# 2.1.0 (November 27, 2018)

## New features

* [[`d40a0abad0`](https://github.com/webhintio/hint/commit/d40a0abad01c750174fbb5e41a6168feae5d4fea)] - New: Allow hint metadata to be imported separately (by [`Tony Ross`](https://github.com/antross)).


# 2.0.0 (November 5, 2018)

## Breaking Changes

* [[`64cef0cc48`](https://github.com/webhintio/hint/commit/64cef0cc48d77a70df196fdb3a96eb1d33f1ea32)] - Breaking: Update `utils-tests-helpers` to `v2.0.0` [skip ci] (by [`Cătălin Mariș`](https://github.com/alrra)).
* [[`59e5b9ade4`](https://github.com/webhintio/hint/commit/59e5b9ade47698d9bae42106cd93606a451b5a56)] - Breaking: Update `hint` to `v4.0.0` [skip ci] (by [`Cătălin Mariș`](https://github.com/alrra)).
* [[`0e82bcad9b`](https://github.com/webhintio/hint/commit/0e82bcad9bd5fb3626bf68d94278b89d685b46c7)] - Breaking: Change `context.report` to take an `options` object (by [`Tony Ross`](https://github.com/antross) / see also: [`#1415`](https://github.com/webhintio/hint/issues/1415)).
* [[`d181168807`](https://github.com/webhintio/hint/commit/d18116880733897793628f0a8e829de941531d18)] - Breaking: Use typed event registration and dispatch (by [`Tony Ross`](https://github.com/antross) / see also: [`#123`](https://github.com/webhintio/hint/issues/123)).


# 1.0.5 (October 31, 2018)

## Bug fixes / Improvements

* [[`3c81bfb673`](https://github.com/webhintio/hint/commit/3c81bfb673dff06d518dcd829e9df793f33b342a)] - Docs: Update broken links (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1459`](https://github.com/webhintio/hint/issues/1459)).


# 1.0.4 (October 2, 2018)

## Bug fixes / Improvements

* [[`0a12ea33fb`](https://github.com/webhintio/hint/commit/0a12ea33fbc9b1e9e222d034ab36e1645c74c9fb)] - Fix: Ignore invalid `href` attributes (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1360`](https://github.com/webhintio/hint/issues/1360)).


# 1.0.3 (September 6, 2018)

## Bug fixes / Improvements

* [[`7cde2e145d`](https://github.com/webhintio/hint/commit/7cde2e145d247ea2dd0a42cbf2aa3a601b223a88)] - Fix: Make `npm` package not include `npm-shrinkwrap.json` file (by [`Cătălin Mariș`](https://github.com/alrra) / see also: [`#1294`](https://github.com/webhintio/hint/issues/1294)).


# 1.0.2 (September 5, 2018)

## Bug fixes / Improvements

* [[`e5d70a61e2`](https://github.com/webhintio/hint/commit/e5d70a61e2570463772944085e8afa7f3354acdf)] - Docs: Fix typo (by [`Jamie R. Rytlewski`](https://github.com/jamierytlewski) / see also: [`#1279`](https://github.com/webhintio/hint/issues/1279)).


# 1.0.1 (August 10, 2018)

## Bug fixes / Improvements

* [[`a6cd292e0c`](https://github.com/webhintio/hint/commit/a6cd292e0ccfb6cecad4295f43bb4d3e59eef770)] - Docs: Make minor improvements (by [`Bruno Vinicius Figueiredo dos Santos`](https://github.com/IAmHopp)).
* [[`e56b39e009`](https://github.com/webhintio/hint/commit/e56b39e009bdcdf432f6111c115c6a455f41afee)] - Docs: Make minor improvements (by [`Bruno Vinicius Figueiredo dos Santos`](https://github.com/IAmHopp)).


# 1.0.0 (August 6, 2018)

✨
