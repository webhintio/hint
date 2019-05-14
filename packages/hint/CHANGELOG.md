# 5.0.0 (May 14, 2019)

## Breaking Changes

* [[`fa1652bb1d`](https://github.com/webhintio/hint/commit/fa1652bb1d99ffc1163dcca337836d9048832ac9)] - Breaking: Validate `Connector`s configuration (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2257`](https://github.com/webhintio/hint/issues/2257)).
* [[`a0a6b54a94`](https://github.com/webhintio/hint/commit/a0a6b54a949300d9a1f03892d8c8858c1547129f)] - Breaking: Refactor `engine.report` to take a `Problem` object (by [`Tony Ross`](https://github.com/antross) / see also: [`#2276`](https://github.com/webhintio/hint/issues/2276)).
* [[`a01fbca4f0`](https://github.com/webhintio/hint/commit/a01fbca4f09b6de97edc698839d64910cb40f76a)] - Breaking: Move `content-type` util from `hint` to `@hint/utils` (by [`Tony Ross`](https://github.com/antross)).
* [[`f3583a2cf8`](https://github.com/webhintio/hint/commit/f3583a2cf8c8a93c0ad726803d7211f7b1383b2b)] - Breaking: Refactor DOM utils inside hint to `@hint/utils` (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2192`](https://github.com/webhintio/hint/issues/2192)).
* [[`09c5383540`](https://github.com/webhintio/hint/commit/09c5383540d207e1b1a1a96cf17a0a32c51ea946)] - Breaking: Remove `utils` in favor of `@hint/utils` (by [`Jesus David García Gomez`](https://github.com/sarvaje)).
* [[`e2ad04570d`](https://github.com/webhintio/hint/commit/e2ad04570df3fc8e968bfd412c617b49759b7ae4)] - Breaking: Move target to options in Formatter.format (by [`Jesus David García Gomez`](https://github.com/sarvaje)).
* [[`12ea169bf9`](https://github.com/webhintio/hint/commit/12ea169bf90dbdcfac6f22cde3d3cb4ebf548213)] - Breaking: Make innerHTML and outerHTML getters (by [`Tony Ross`](https://github.com/antross)).
* [[`889327dad5`](https://github.com/webhintio/hint/commit/889327dad55500fb1e12f354e1d0abdfdc0b56ed)] - Breaking: Remove IAsync* and use HTMLDocument and HTMLElement (by [`Jesus David García Gomez`](https://github.com/sarvaje)).

## Bug fixes / Improvements

* [[`b988b212d8`](https://github.com/webhintio/hint/commit/b988b212d8e08b1c4e5b5a005d053966d2b5cfe1)] - Fix: Trim source snippets auto-generated from element references (by [`Tony Ross`](https://github.com/antross) / see also: [`#2211`](https://github.com/webhintio/hint/issues/2211)).
* [[`75f69a9ba8`](https://github.com/webhintio/hint/commit/75f69a9ba87a3db70844a7107e10186adea45164)] - Fix: Correct CLI link to telemetry page (by [`Karan Sapolia`](https://github.com/karansapolia) / see also: [`#2339`](https://github.com/webhintio/hint/issues/2339)).
* [[`e54532539e`](https://github.com/webhintio/hint/commit/e54532539ec3d1173477e051853da07dcb9436f4)] - Docs: Fix outdated info about test runner (by [`Shivang Tripathi`](https://github.com/shivangg)).
* [[`b7b4866def`](https://github.com/webhintio/hint/commit/b7b4866def7a5bad3cddcb05b49a51b0c5b52bec)] - Fix: Error location for HTTP headers and added code snippet (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2209`](https://github.com/webhintio/hint/issues/2209)).
* [[`2dfb338234`](https://github.com/webhintio/hint/commit/2dfb3382347cd264561adc378d6c73972bd1bae6)] - Fix: Review pinned version of packages (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2025`](https://github.com/webhintio/hint/issues/2025)).
* [[`8a44353000`](https://github.com/webhintio/hint/commit/8a44353000cfc30278ef32fa68ca1e3269b25a72)] - Docs: Update URL to forked one in instructions (by [`Shivang Tripathi`](https://github.com/shivangg) / see also: [`#2238`](https://github.com/webhintio/hint/issues/2238)).
* [[`7b44f65c73`](https://github.com/webhintio/hint/commit/7b44f65c73cf9f357b8b43354b046e2a294e9822)] - Docs: Stop capitalizing the `x` in axe (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2215`](https://github.com/webhintio/hint/issues/2215)).
* [[`9d3551e76f`](https://github.com/webhintio/hint/commit/9d3551e76ff7be5677dfc95b96b54340cb219ac3)] - Fix: Make formatters unique when extending configurations (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2077`](https://github.com/webhintio/hint/issues/2077)).
* [[`bff51557e4`](https://github.com/webhintio/hint/commit/bff51557e4fdb9bf921d3dbe60a85d897fe9abde)] - Fix: Use correct base URL in `getElementByUrl` (by [`Tony Ross`](https://github.com/antross) / see also: [`#2148`](https://github.com/webhintio/hint/issues/2148)).
* [[`2abb707a30`](https://github.com/webhintio/hint/commit/2abb707a3052b09a41ed07f8b5574bd909f65a7d)] - Docs: Improvements and tweaks (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1786`](https://github.com/webhintio/hint/issues/1786)).
* [[`695a61e38d`](https://github.com/webhintio/hint/commit/695a61e38d099efe3daa854b74ece6aa6fafe164)] - Docs: Update `README.md` information (by [`Antón Molleda`](https://github.com/molant)).
* [[`fefa0bf8aa`](https://github.com/webhintio/hint/commit/fefa0bf8aa96aed556a62bf3f501e791dd9c8ece)] - Fix: Missing dependencies (by [`Antón Molleda`](https://github.com/molant)).
* [[`b00f577c62`](https://github.com/webhintio/hint/commit/b00f577c62d492a1012022552b1c54db71c1d6ac)] - Docs: Improve `formatter` documentation (by [`Antón Molleda`](https://github.com/molant)).
* [[`7ed5d1ed72`](https://github.com/webhintio/hint/commit/7ed5d1ed727d4818af46c53b43d0c43a3bb80086)] - Fix: Include `application/javascript` in recognized mime types (by [`Tony Ross`](https://github.com/antross)).
* [[`48b45ff6f5`](https://github.com/webhintio/hint/commit/48b45ff6f5a94825f33cb83c4307e678b52da352)] - Fix: `onHintEvent` race condition causing invalid `eventName` (by [`Tony Ross`](https://github.com/antross)).
* [[`62e6fa9b22`](https://github.com/webhintio/hint/commit/62e6fa9b223a73eca997d3b82bd0cffd0103897d)] - Fix: Change 'boxen' import and remove '@types/boxen' (by [`Karan Sapolia`](https://github.com/karansapolia) / see also: [`#2036`](https://github.com/webhintio/hint/issues/2036)).
* [[`29b22740ad`](https://github.com/webhintio/hint/commit/29b22740ad4948d424a2072349dc8dfb7bc99134)] - Fix: Tie more elements from DOM snapshot back to original source (by [`Tony Ross`](https://github.com/antross)).

## New features

* [[`a17d29aac9`](https://github.com/webhintio/hint/commit/a17d29aac9bcd31fe640547efc8f2e785eaea5a4)] - New: Add `schema-validation` and `json-parser`  to utils (by [`Antón Molleda`](https://github.com/molant)).
* [[`0edaba4b16`](https://github.com/webhintio/hint/commit/0edaba4b16425d9ac1051e673c8ed9e7abfbcc02)] - New: Add a snapshot utility (by [`Tony Ross`](https://github.com/antross)).
* [[`d934aeb9b7`](https://github.com/webhintio/hint/commit/d934aeb9b714a7ddcaf1d09a3790348eaa4c335b)] - New: Node.js API (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1532`](https://github.com/webhintio/hint/issues/1532)).
* [[`f8cbcef837`](https://github.com/webhintio/hint/commit/f8cbcef8379fa2b97c990fbfae6a74b13a4a6c8f)] - New: Add `utils` package (by [`Jesus David García Gomez`](https://github.com/sarvaje)).
* [[`640bd86d6d`](https://github.com/webhintio/hint/commit/640bd86d6db80d039c87b273ba5785c25a725aa2)] - New: Add parameter to output formatter output to a file (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2056`](https://github.com/webhintio/hint/issues/2056)).
* [[`b9708aea55`](https://github.com/webhintio/hint/commit/b9708aea55cccdd2fe12bd9719392064f02052c3)] - New: Add API to get the location of content in an element (by [`Tony Ross`](https://github.com/antross)).
* [[`d8490b3085`](https://github.com/webhintio/hint/commit/d8490b3085b4ab51bedab152327a9ef909df6871)] - New: Add utils to traverse the dom using an HTMLDocument (by [`Jesus David García Gomez`](https://github.com/sarvaje)).
* [[`0439f9bc38`](https://github.com/webhintio/hint/commit/0439f9bc38f3f3d72779bcbe0a164267c8ea3db0)] - New: Add HTMLDocument and HTMLElement type (by [`Jesus David García Gomez`](https://github.com/sarvaje)).

## Chores

* [[`f1d392c919`](https://github.com/webhintio/hint/commit/f1d392c91988e1bdd5768568a98c72679d20c98a)] - Upgrade: Bump @types/lodash from 4.14.124 to 4.14.126 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`0994c8857e`](https://github.com/webhintio/hint/commit/0994c8857eef2fea3c7d89ef3ec8ca354565979f)] - Chore: Fix docs linting issues (by [`Antón Molleda`](https://github.com/molant)).
* [[`6762a89277`](https://github.com/webhintio/hint/commit/6762a89277bad213b841cee5bb7f7eff4918095f)] - Upgrade: Bump @types/async from 2.4.1 to 2.4.2 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`14d9bbbf47`](https://github.com/webhintio/hint/commit/14d9bbbf473f173d3efc3859a7450dc041855544)] - Chore: Update User-Agent to more recent one (by [`Antón Molleda`](https://github.com/molant)).
* [[`84dc626ff2`](https://github.com/webhintio/hint/commit/84dc626ff2f8113122d0f8bcca8ba339465cc0c4)] - Upgrade: Bump @types/lodash from 4.14.123 to 4.14.124 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`907995d47e`](https://github.com/webhintio/hint/commit/907995d47ec7dcdee2e3f336f026f9901e55f291)] - Upgrade: Bump @types/node from 11.13.9 to 12.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`0f70f6f773`](https://github.com/webhintio/hint/commit/0f70f6f773235cdab31d5811eaa5f0ff9be9650f)] - Upgrade: Bump nyc from 14.0.0 to 14.1.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`8332a32710`](https://github.com/webhintio/hint/commit/8332a32710329a40a628d4e61286a0a5464fb11f)] - Upgrade: Bump @types/node from 11.13.8 to 11.13.9 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c0930d797f`](https://github.com/webhintio/hint/commit/c0930d797fd907d4b9678990f455bd02b3c2e192)] - Upgrade: Bump browserslist from 4.5.5 to 4.5.6 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`78b390d31b`](https://github.com/webhintio/hint/commit/78b390d31b89bce34b6f5706377f01d01c92cb5a)] - Upgrade: Bump boxen from 3.1.0 to 3.2.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`60624562af`](https://github.com/webhintio/hint/commit/60624562af11362cf834f1791c6f3c1dfe84385d)] - Upgrade: Bump @types/node from 11.13.5 to 11.13.8 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`2075b77ab1`](https://github.com/webhintio/hint/commit/2075b77ab1b05aadc51329261df3fbc9d83cc09e)] - Upgrade: Bump typescript from 3.4.4 to 3.4.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`15aeb57f27`](https://github.com/webhintio/hint/commit/15aeb57f2753dce8e6b7c78a9cc5c5376a538835)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.6.0 to 1.7.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`7c89c54dc0`](https://github.com/webhintio/hint/commit/7c89c54dc035641db905a2d057dc2ba04af09eb1)] - Upgrade: Bump @typescript-eslint/parser from 1.6.0 to 1.7.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`b7a588d442`](https://github.com/webhintio/hint/commit/b7a588d442233484c5ffdff41865761213b4121a)] - Upgrade: Bump typescript from 3.4.3 to 3.4.4 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c119a3562d`](https://github.com/webhintio/hint/commit/c119a3562dd487b8e48f20c99ed27d37b92288a8)] - Upgrade: Bump @types/node from 11.13.4 to 11.13.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c8f87f8cb3`](https://github.com/webhintio/hint/commit/c8f87f8cb3318ef0abf1259e7a78f920c2f6701e)] - Upgrade: Bump eslint-plugin-import from 2.16.0 to 2.17.2 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`d6e55c5300`](https://github.com/webhintio/hint/commit/d6e55c5300b8b855c83e03428fbedc75f7a4f5bd)] - Upgrade: Bump sinon from 7.3.1 to 7.3.2 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`d4b62e452a`](https://github.com/webhintio/hint/commit/d4b62e452a8b745cc5b21cac32770599cf44afc4)] - Upgrade: Bump browserslist from 4.5.4 to 4.5.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`83510aecf9`](https://github.com/webhintio/hint/commit/83510aecf9657aadbc987ae7ad66603a1da1e8e0)] - Upgrade: Bump nyc from 13.3.0 to 14.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`aae4a30c02`](https://github.com/webhintio/hint/commit/aae4a30c02a0635328d98589a6020ec0a27f4579)] - Chore: Reference elements from snapshots in reports (by [`Tony Ross`](https://github.com/antross)).
* [[`95afd628a6`](https://github.com/webhintio/hint/commit/95afd628a65af40a318f39c944dd358753b1c2ed)] - Chore: Remove `@types/file-url` and update `import` (by [`Antón Molleda`](https://github.com/molant)).
* [[`328bd08842`](https://github.com/webhintio/hint/commit/328bd0884273c25294509f85b95467930eaebb9e)] - Upgrade: Bump file-url from 2.0.2 to 3.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`dc1c13788b`](https://github.com/webhintio/hint/commit/dc1c13788bb3c4f381d78950e784b5f09803b896)] - Upgrade: Bump file-type from 10.10.0 to 10.11.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`3f591e798f`](https://github.com/webhintio/hint/commit/3f591e798f352ec47bab83e53ed548318688e51a)] - Upgrade: Bump typescript from 3.3.4000 to 3.4.3 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`779639cbcb`](https://github.com/webhintio/hint/commit/779639cbcb5c8a4b8527fc48f6cf68e323788e09)] - Upgrade: Bump boxen from 3.0.0 to 3.1.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`740485fece`](https://github.com/webhintio/hint/commit/740485feceb2ef0411cbe25798e027f7b6459225)] - Upgrade: Bump is-svg from 4.0.0 to 4.1.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`e31be5d9b2`](https://github.com/webhintio/hint/commit/e31be5d9b25f3050590f12b286f8663ffaa80b8d)] - Upgrade: Bump applicationinsights from 1.3.0 to 1.3.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`74c99a8e92`](https://github.com/webhintio/hint/commit/74c99a8e929a1b8d408b3bb0211e3a88e77a43f6)] - Upgrade: Bump applicationinsights from 1.2.0 to 1.3.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`ee6926da4a`](https://github.com/webhintio/hint/commit/ee6926da4ad6dbefb6582d18659f9016d7413ec4)] - Upgrade: Bump @types/sinon from 7.0.10 to 7.0.11 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`b55995eb57`](https://github.com/webhintio/hint/commit/b55995eb57db7ce9b8e58c9d528b8b13e8d8c906)] - Upgrade: Bump ora from 3.3.1 to 3.4.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`f1c089a027`](https://github.com/webhintio/hint/commit/f1c089a027fb1e0cc0450824d3ee5bc3d854aca2)] - Upgrade: Bump @types/semver from 5.5.0 to 6.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`d6b60cfed7`](https://github.com/webhintio/hint/commit/d6b60cfed78f3706ac7d201ef8c4800aecb0381f)] - Upgrade: Bump browserslist from 4.5.3 to 4.5.4 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`99dda8c41d`](https://github.com/webhintio/hint/commit/99dda8c41d56212a346047de6c2886e9c024aa46)] - Upgrade: Bump ora from 3.3.0 to 3.3.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`8242d3549a`](https://github.com/webhintio/hint/commit/8242d3549a2889e4ff781cbd2e49e2e02d043e30)] - Upgrade: Bump ora from 3.2.0 to 3.3.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`814cb1087a`](https://github.com/webhintio/hint/commit/814cb1087a4c7bcdd9a7c6102b7488abbf92b8d9)] - Upgrade: Bump file-type from 10.9.0 to 10.10.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`30b00af4f2`](https://github.com/webhintio/hint/commit/30b00af4f23e8d86b3cfa33ebb74edfd623209f3)] - Upgrade: Bump globby from 9.1.0 to 9.2.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`4ed18eabb9`](https://github.com/webhintio/hint/commit/4ed18eabb9d6361c0d6fe061a82ce6f90b0f955d)] - Upgrade: Bump browserslist from 4.5.2 to 4.5.3 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`ec2243b3fe`](https://github.com/webhintio/hint/commit/ec2243b3fe3646ddb99dae643d1915b05e3a01e7)] - Upgrade: Bump jsonc-parser from 2.0.3 to 2.1.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`8425c1cfee`](https://github.com/webhintio/hint/commit/8425c1cfeefbca6014cc78a2486c4f5133a16e3e)] - Upgrade: Bump @types/debug from 4.1.2 to 4.1.3 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`f50942e1ac`](https://github.com/webhintio/hint/commit/f50942e1ac6658f9e4b333f7f3a7342ab98b48ea)] - Upgrade: Bump ava from 1.4.0 to 1.4.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`20977a7026`](https://github.com/webhintio/hint/commit/20977a70263218cfdbfe3ff37a9ce7398ed8f795)] - Upgrade: Bump sinon from 7.3.0 to 7.3.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c8eb30606a`](https://github.com/webhintio/hint/commit/c8eb30606a39c9175e1ec43a8d693d04ff5842d4)] - Upgrade: Bump ava from 1.3.1 to 1.4.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`04d5d4458f`](https://github.com/webhintio/hint/commit/04d5d4458fa3186557eac7245886eba069af616a)] - Upgrade: Bump semver from 5.6.0 to 6.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`cf01687635`](https://github.com/webhintio/hint/commit/cf0168763549e7ac3f02d3e406bec65bd9e96eb2)] - Upgrade: Bump @types/node from 11.11.8 to 11.12.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`6b9e20e0d2`](https://github.com/webhintio/hint/commit/6b9e20e0d2736b3306978fd4f313cade006e157e)] - Chore: Fix linting issues (by [`Antón Molleda`](https://github.com/molant)).
* [[`f37d646f3a`](https://github.com/webhintio/hint/commit/f37d646f3a45b52ba233fe6421976178d55c359e)] - Chore: Update `lint:md` script (by [`Antón Molleda`](https://github.com/molant)).
* [[`039f1d3a32`](https://github.com/webhintio/hint/commit/039f1d3a32b989435ef408d69bae2dd9544b8fe0)] - Upgrade: Bump @types/node from 11.11.7 to 11.11.8 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`4571a8249c`](https://github.com/webhintio/hint/commit/4571a8249c91396c7bc9a8e2f84a7d5eaa13f528)] - Chore: Remove `async` dependency (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2098`](https://github.com/webhintio/hint/issues/2098)).
* [[`ecae90832d`](https://github.com/webhintio/hint/commit/ecae90832d40fb4270c13395ddd35e27acf8117f)] - Upgrade: Bump @types/node from 11.11.6 to 11.11.7 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`879d4b2c59`](https://github.com/webhintio/hint/commit/879d4b2c59ff8a4a58e547639624d3efc3e3e38b)] - Chore: Scope lodash imports to reduce browser extension size (by [`Tony Ross`](https://github.com/antross)).
* [[`ae52a5e661`](https://github.com/webhintio/hint/commit/ae52a5e661ebd06ffdcd73d4cdcdc30bda62ac8d)] - Upgrade: Bump @types/node from 11.11.5 to 11.11.6 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`3f94789dca`](https://github.com/webhintio/hint/commit/3f94789dcaf69db0047858becd18e1aedf406dcd)] - Upgrade: Bump typescript from 3.3.3333 to 3.3.4000 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`95f821267a`](https://github.com/webhintio/hint/commit/95f821267a13c35570f547294d34396bd8a01d33)] - Upgrade: Bump browserslist from 4.5.1 to 4.5.2 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`4e8c353d05`](https://github.com/webhintio/hint/commit/4e8c353d05da6d2ef0e8db7b5ca8accfb0c27a16)] - Upgrade: Bump @types/node from 11.11.4 to 11.11.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`f9fa6be4d4`](https://github.com/webhintio/hint/commit/f9fa6be4d48d339738a5f9a8ff257a75cba8ce97)] - Upgrade: Bump sinon from 7.2.7 to 7.3.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`b5a596a511`](https://github.com/webhintio/hint/commit/b5a596a5114ab06aa7408079cd9a30696ec24d58)] - Upgrade: Bump raw-loader from 1.0.0 to 2.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c38104cdd9`](https://github.com/webhintio/hint/commit/c38104cdd92e12c1395d704a4271cfa23fb18727)] - Upgrade: Bump @types/node from 11.11.3 to 11.11.4 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`ae5124479d`](https://github.com/webhintio/hint/commit/ae5124479d63d9d4bdafa0cac211eb2857485f50)] - Chore: Refactor location tests to match similar text (by [`Tony Ross`](https://github.com/antross)).
* [[`2121c3fb60`](https://github.com/webhintio/hint/commit/2121c3fb60c5e2478d6c0c48311d9a24eec65c3e)] - Upgrade: Bump browserslist from 4.5.0 to 4.5.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`a0cc75f478`](https://github.com/webhintio/hint/commit/a0cc75f478d0ad242f893eef3ac115d397fbf13c)] - Upgrade: Bump browserslist from 4.4.2 to 4.5.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`4ad0ea4187`](https://github.com/webhintio/hint/commit/4ad0ea41871335a9958df710e4dba33f92e301a8)] - Chore: Fix report positions in tests (by [`Tony Ross`](https://github.com/antross)).
* [[`8aca1d9472`](https://github.com/webhintio/hint/commit/8aca1d9472703f153d3a4cedae1b776d32f6da02)] - Upgrade: Bump @types/sinon from 7.0.9 to 7.0.10 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`5859e56f8e`](https://github.com/webhintio/hint/commit/5859e56f8e14944a0bd130c8abeecb822622ccf3)] - Upgrade: Bump @types/node from 11.11.1 to 11.11.3 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`bb4c36429a`](https://github.com/webhintio/hint/commit/bb4c36429ac8e66c1b93525d1c6204b9b7ec8827)] - Upgrade: Bump @types/lodash from 4.14.122 to 4.14.123 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`b3f3d412b6`](https://github.com/webhintio/hint/commit/b3f3d412b603b0bf7e2e290ab3614e24acf2d277)] - Upgrade: Bump @types/node from 11.11.0 to 11.11.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`d82afffe66`](https://github.com/webhintio/hint/commit/d82afffe6668e81e6903e7a130daa07d730afb91)] - Upgrade: Bump @types/node from 11.10.5 to 11.11.0 (by [`Dependabot`](https://github.com/dependabot-bot)).


# 4.5.0 (March 7, 2019)

## New features

* [[`8bed0b0ddb`](https://github.com/webhintio/hint/commit/8bed0b0ddbdd0ab72e321f2a8f9f55a0231bb982)] - New: Expose `ignoredUrls` in `HintContext` (by [`Jesus David García Gomez`](https://github.com/sarvaje)).


# 4.4.1 (February 21, 2019)

## Bug fixes / Improvements

* [[`d59b36717d`](https://github.com/webhintio/hint/commit/d59b36717d508499c8022729ed7da9405f8ec5bd)] - Fix: Honor `--debug` parameter even when `DEBUG` env is set (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1349`](https://github.com/webhintio/hint/issues/1349)).
* [[`30e54ae215`](https://github.com/webhintio/hint/commit/30e54ae215d4a7fb5edd0bab79c2fd5b5ffd8b45)] - Docs: Improve commit message template (by [`Karan Sapolia`](https://github.com/karansapolia) / see also: [`#1844`](https://github.com/webhintio/hint/issues/1844)).
* [[`44674e9c44`](https://github.com/webhintio/hint/commit/44674e9c4479cb3f3e3c2e66173437c74481f487)] - Fix: Refactor for file name convention (#1861) (by [`Karan Sapolia`](https://github.com/karansapolia) / see also: [`#1748`](https://github.com/webhintio/hint/issues/1748)).
* [[`eb90fb42ef`](https://github.com/webhintio/hint/commit/eb90fb42ef487dbca918a0da9e86c7a368eeac42)] - Fix: Force `formatters` to be an `Array` only (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1865`](https://github.com/webhintio/hint/issues/1865)).


# 4.4.0 (February 7, 2019)

## Bug fixes / Improvements

* [[`c34e1cdd6a`](https://github.com/webhintio/hint/commit/c34e1cdd6a61062d8b590edf98897b9927c604f8)] - Docs: Update server configurations (by [`Antón Molleda`](https://github.com/molant)).
* [[`36b564624c`](https://github.com/webhintio/hint/commit/36b564624c0f899987d1b9dd84185899e592dfb9)] - Fix: Report inherited errors at `extends` location (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1717`](https://github.com/webhintio/hint/issues/1717)).
* [[`ed20a1c9b3`](https://github.com/webhintio/hint/commit/ed20a1c9b3d7ef150380b4536562d83b753ea965)] - Fix: Handle newlines in attribute values (by [`Tony Ross`](https://github.com/antross) / see also: [`#1792`](https://github.com/webhintio/hint/issues/1792)).
* [[`5505bd9471`](https://github.com/webhintio/hint/commit/5505bd9471b29bd932a3924098126c0b6403dc6d)] - Docs: Update Built-In scripts information (by [`Antón Molleda`](https://github.com/molant)).

## New features

* [[`fac28bc0be`](https://github.com/webhintio/hint/commit/fac28bc0bec87a81472f6810ef6764d2ab16a069)] - New: Add category `pitfalls` (by [`Stephanie `](https://github.com/ststimac)).


# 4.3.1 (January 16, 2019)

## Bug fixes / Improvements

* [[`6b01be9287`](https://github.com/webhintio/hint/commit/6b01be9287179e9bcda02f65f6e4c0475f47f249)] - Fix: Update `configuration-web-recommended` to `v5.0.0` (by [`Antón Molleda`](https://github.com/molant)).


# 4.3.0 (January 15, 2019)

## Bug fixes / Improvements

* [[`e90f410556`](https://github.com/webhintio/hint/commit/e90f410556c817012e7667c8f4f0e27b14d91bd2)] - Fix: Improve feedback when config is invalid (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1526`](https://github.com/webhintio/hint/issues/1526)).

## New features

* [[`5e898c84fd`](https://github.com/webhintio/hint/commit/5e898c84fd8f7a3cda152c57eea9b0dc683dfceb)] - New: Add `Compatibility` category (by [`Antón Molleda`](https://github.com/molant)).


# 4.2.0 (January 10, 2019)

## Bug fixes / Improvements

* [[`39b5c18b4b`](https://github.com/webhintio/hint/commit/39b5c18b4b8b3ec150aac0a221a0a1072c730210)] - Fix: JSON schema issue with `ignoredUrls` (by [`Jesus David García Gomez`](https://github.com/sarvaje)).
* [[`ccb6731bb2`](https://github.com/webhintio/hint/commit/ccb6731bb2ed548360b7cba57a3b020de64b20b8)] - Docs: Clarify browserslist configuration precedence (by [`Tony Ross`](https://github.com/antross) / see also: [`#1611`](https://github.com/webhintio/hint/issues/1611)).

## New features

* [[`4516544660`](https://github.com/webhintio/hint/commit/4516544660ad534e3bd19e3ea186b9fa9edd97c1)] - New: Deprecate unused `Configuration` methods (by [`Tony Ross`](https://github.com/antross)).


# 4.1.2 (December 31, 2018)

## Bug fixes / Improvements

* [[`c412f9aa7b`](https://github.com/webhintio/hint/commit/c412f9aa7ba99eb7ef6c20b7c496d629530f3ecf)] - Docs: Fix reference links and remove `markdownlint-cli` dependency (#1566) (by [`Antón Molleda`](https://github.com/molant)).
* [[`f72dbccc86`](https://github.com/webhintio/hint/commit/f72dbccc868b0840d93a50fd2b4bc3e19a702b76)] - Docs: Fix some links (by [`Jesus David García Gomez`](https://github.com/sarvaje)).


# 4.1.1 (December 12, 2018)

## Bug fixes / Improvements

* [[`c412f9aa7b`](https://github.com/webhintio/hint/commit/c412f9aa7ba99eb7ef6c20b7c496d629530f3ecf)] - Docs: Fix reference links and remove `markdownlint-cli` dependency (#1566) (by [`Antón Molleda`](https://github.com/molant)).
* [[`f72dbccc86`](https://github.com/webhintio/hint/commit/f72dbccc868b0840d93a50fd2b4bc3e19a702b76)] - Docs: Fix some links (by [`Jesus David García Gomez`](https://github.com/sarvaje)).


# 4.1.0 (November 27, 2018)

## Bug fixes / Improvements

* [[`7f0d8994cb`](https://github.com/webhintio/hint/commit/7f0d8994cb9ee6ead9c98e256efdeb067a861970)] - Docs: Update internal links to `.md` files (by [`Antón Molleda`](https://github.com/molant)).

## New features

* [[`d40a0abad0`](https://github.com/webhintio/hint/commit/d40a0abad01c750174fbb5e41a6168feae5d4fea)] - New: Allow hint metadata to be imported separately (by [`Tony Ross`](https://github.com/antross)).


# 4.0.3 (November 16, 2018)

## Bug fixes / Improvements

* [[`e56c6df5d1`](https://github.com/webhintio/hint/commit/e56c6df5d135c9f26ee7fcfef9e19ffd8534236b)] - Docs: Add Troubleshoot section (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1464`](https://github.com/webhintio/hint/issues/1464)).


# 4.0.2 (November 9, 2018)

## Bug fixes / Improvements

* [[`5d1bf635a5`](https://github.com/webhintio/hint/commit/5d1bf635a51f4a8fce7096041dcd8bc061a9eeec)] - Fix: Find modules inside configurations (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1437`](https://github.com/webhintio/hint/issues/1437)).


# 4.0.1 (November 5, 2018)

## Bug fixes / Improvements

* [[`fdec57602d`](https://github.com/webhintio/hint/commit/fdec57602d931e945a27b53ab2a58af05199279e)] - Fix: Update `configuration-web-recommended` to `v2.0.0` [skip ci] (by [`Cătălin Mariș`](https://github.com/alrra)).


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
