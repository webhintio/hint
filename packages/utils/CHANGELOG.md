# 7.0.1 (December 4, 2019)

## Bug fixes / Improvements

* [[`efccecedfc`](https://github.com/webhintio/hint/commit/efccecedfc6657f53fd22b60bf99661fcd758337)] - Fix: Media type for php files (see also: [`#3402`](https://github.com/webhintio/hint/issues/3402)).


# 7.0.0 (December 2, 2019)

## Breaking Changes

* [[`8ed008ffe9`](https://github.com/webhintio/hint/commit/8ed008ffe926edba18390bc12e909ac77799b2c8)] - Breaking: Remove `chromium-finder` from `@hint/utils`.
* [[`d59be96330`](https://github.com/webhintio/hint/commit/d59be963309bf0df971f374a010d21312c2efd3e)] - Breaking: Group types with utils implementation (see also: [`#2392`](https://github.com/webhintio/hint/issues/2392)).
* [[`669418b8bb`](https://github.com/webhintio/hint/commit/669418b8bbb6ca38809c5a9f92b5c1e21b16dc21)] - Breaking: Remove string utils in favor of @hint/utils-string.
* [[`d7e8713ce4`](https://github.com/webhintio/hint/commit/d7e8713ce47be7c6102a111eecf62ecdddb2d405)] - Breaking: Remove test utils in favor of @hint/utils-tests-helpers.
* [[`28fcba4dad`](https://github.com/webhintio/hint/commit/28fcba4dad74b80a9d39f6eab15fd4eb21e8a8c9)] - Breaking: Remove json utils in favor of @hint/utils-json.
* [[`a38575c2a0`](https://github.com/webhintio/hint/commit/a38575c2a058b0d509fb1efac71c7169c8d2fe71)] - Breaking: Remove fs utils in favor of @hint/utils-fs.
* [[`e01d0c9dcf`](https://github.com/webhintio/hint/commit/e01d0c9dcf1fb36318e9dc4ef2c54f3119d1572a)] - Breaking: Remove Network utils in favor of @hint/utils-network.
* [[`6374160953`](https://github.com/webhintio/hint/commit/63741609538a02510462beb504c23cc0cc1f34d9)] - Breaking: Remove CSS tools in favor of @hint/utils-css.
* [[`c0438631ad`](https://github.com/webhintio/hint/commit/c0438631ad40f68dccc66f9719e1e3befa60e66f)] - Breaking: Removing DOM utils in favor of @hint/utils-dom.
* [[`2324eb0902`](https://github.com/webhintio/hint/commit/2324eb0902620381862bda31ac958cb704b768e4)] - Breaking: Remove shortcuts to some types.
* [[`fb8e66f97e`](https://github.com/webhintio/hint/commit/fb8e66f97e91c05439af812745646a174862669c)] - Breaking: Remove i18n utils in favor of @hint/utils-i18n.
* [[`4c39e5a85f`](https://github.com/webhintio/hint/commit/4c39e5a85f17d4e37d855bb1c7f93f1ac11488bb)] - Breaking: Remove debug in favor of @hint/utils-debug.
* [[`751b60a7ca`](https://github.com/webhintio/hint/commit/751b60a7ca3ed4c459e5f62a1b2ca863b42cc5d3)] - Breaking: Allow flattened imports from utils (see also: [`#2444`](https://github.com/webhintio/hint/issues/2444)).

## New features

* [[`411182de46`](https://github.com/webhintio/hint/commit/411182de46725ab6c5c297830c46b0ccb8bf81a3)] - New: DOM utils package.
* [[`e06405e79b`](https://github.com/webhintio/hint/commit/e06405e79bc46ef6e3c0844f986db6b392e8188c)] - New: Validate reported Severity.
* [[`d62df35cb7`](https://github.com/webhintio/hint/commit/d62df35cb7794746bf8b9f9b08937dc40b6a2438)] - New: Severity with "default" value for hints.
* [[`a7278f2f78`](https://github.com/webhintio/hint/commit/a7278f2f78edb07df5e610c3b207c3b779ec1f2b)] - New: More severities and threshold in schema (see also: [`#3065`](https://github.com/webhintio/hint/issues/3065)).

## Bug fixes / Improvements

* [[`15bda95316`](https://github.com/webhintio/hint/commit/15bda9531648914d6374118e25bf6dbd3608b9e8)] - Fix: Make `browser` case insensitive (see also: [`#3058`](https://github.com/webhintio/hint/issues/3058)).
* [[`b9d323fafe`](https://github.com/webhintio/hint/commit/b9d323fafe4b2f1ff03129839d37dbf922b61571)] - Fix: Correctly search and load 3rd party resources (see also: [`#2796`](https://github.com/webhintio/hint/issues/2796)).
* [[`7ea9591f38`](https://github.com/webhintio/hint/commit/7ea9591f38c2a79d9943bcb9ce6303db3a6556fb)] - Fix: Schema and Types for hints (see also: [`#3348`](https://github.com/webhintio/hint/issues/3348)).
* [[`b316158bd2`](https://github.com/webhintio/hint/commit/b316158bd2f6510e049aaad21ae145bb2dde7fd6)] - Fix: Increase utils package coverage.
* [[`bd5c175614`](https://github.com/webhintio/hint/commit/bd5c175614dd02451d1bfbf78bcde01825504bc5)] - Fix: Move @types/request to dependencies (see also: [`#3206`](https://github.com/webhintio/hint/issues/3206)).

## Chores

* [[`f044c9b5a1`](https://github.com/webhintio/hint/commit/f044c9b5a1ef400ab50a6065cea7a8c9758db8bc)] - Chore: Update references to old methods/types in hint.
* [[`2c60ff85bd`](https://github.com/webhintio/hint/commit/2c60ff85bd9f8e5f8f6b17c4bb05cb61b9d219ea)] - Chore: Change unreleased packages version to 0.0.1.
* [[`5ef883ef1d`](https://github.com/webhintio/hint/commit/5ef883ef1d9f6eb8fc1e229c211182d441cb4a98)] - Upgrade: Bump eslint from 6.5.1 to 6.6.0.
* [[`9142edc7d3`](https://github.com/webhintio/hint/commit/9142edc7d362bfa44c3f5acab05ef44e52184143)] - Upgrade: Bump eslint-plugin-markdown from 1.0.0 to 1.0.1.
* [[`fb4871a7dc`](https://github.com/webhintio/hint/commit/fb4871a7dc412f60ede54646c1e178f55d39d348)] - Upgrade: Bump applicationinsights from 1.5.0 to 1.6.0.
* [[`a112f4b99b`](https://github.com/webhintio/hint/commit/a112f4b99b3b41abf8951c4557ec37d42cb4f866)] - Chore: Update formatters to support new severity values (see also: [`#3182`](https://github.com/webhintio/hint/issues/3182), and [`#3345`](https://github.com/webhintio/hint/issues/3345)).
* [[`e9172328e7`](https://github.com/webhintio/hint/commit/e9172328e7494e6bba58f361ec83c24c37123840)] - Chore: Drop `engine` field in `package.json`.
* [[`e4bddb1f05`](https://github.com/webhintio/hint/commit/e4bddb1f05b2f06ccbcfcc3c2aa7d01660c495d6)] - Upgrade: Bump @types/semver from 6.0.2 to 6.2.0.
* [[`97bb31d0fa`](https://github.com/webhintio/hint/commit/97bb31d0fafb53572220cd647bb493716587ca2b)] - Chore: Update references to the new @hint/utils-types.


# 6.1.0 (October 29, 2019)

## Bug fixes / Improvements

* [[`34438d81f7`](https://github.com/webhintio/hint/commit/34438d81f7ea1b25d2dc1e02c754714bce13e73a)] - Fix: Location for JSON errors (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2222`](https://github.com/webhintio/hint/issues/2222), and [`#3123`](https://github.com/webhintio/hint/issues/3123)).

## New features

* [[`acd232b412`](https://github.com/webhintio/hint/commit/acd232b4126a28db92d4017f3add35baae25d9e5)] - New: Recognize files ending with `*.ts(x)` as TypeScript (by [`Tony Ross`](https://github.com/antross)).
* [[`de43df9bbd`](https://github.com/webhintio/hint/commit/de43df9bbd2178c6ae7d40156f485193a9b5218c)] - New: Allow ranged locations in CSS (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#3130`](https://github.com/webhintio/hint/issues/3130)).
* [[`4c547966cd`](https://github.com/webhintio/hint/commit/4c547966cd32f4cfc88f6910050b1d9a5a21b85c)] - New: Add isFragment and isAttributeAnExpression (by [`Tony Ross`](https://github.com/antross)).

## Chores

* [[`f850f2274b`](https://github.com/webhintio/hint/commit/f850f2274b630604f4eb72c1d469e78bc4222ca1)] - Upgrade: Bump postcss from 7.0.18 to 7.0.21 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`ce965513ae`](https://github.com/webhintio/hint/commit/ce965513ae2b715881d4f7891e795c046579f0d5)] - Upgrade: Bump ava from 1.4.1 to 2.4.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview) / see also: [`#3022`](https://github.com/webhintio/hint/issues/3022)).
* [[`b8ba2e17cd`](https://github.com/webhintio/hint/commit/b8ba2e17cdca7fccfd274b2ba250a96329b23fe8)] - Upgrade: Bump sinon from 7.4.2 to 7.5.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`0d0466efff`](https://github.com/webhintio/hint/commit/0d0466efff7915f2ff929e0e85223841178eaac0)] - Upgrade: Bump typescript from 3.6.3 to 3.6.4 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`94e004be77`](https://github.com/webhintio/hint/commit/94e004be7773e4bf5b9381ab9147bc9423b89ee8)] - Upgrade: Bump jsdom from 15.1.1 to 15.2.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`0cfa8ecfbf`](https://github.com/webhintio/hint/commit/0cfa8ecfbf23aa46fb3e88794531144ab262ca21)] - Chore: Update proxyquire and fix tests (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#3121`](https://github.com/webhintio/hint/issues/3121)).


# 6.0.0 (October 16, 2019)

## Breaking Changes

* [[`56788d56a1`](https://github.com/webhintio/hint/commit/56788d56a12107abea37502f13c7012573677efb)] - Breaking: Extract compat information to new package (by [`Antón Molleda`](https://github.com/molant) / see also: [`#3035`](https://github.com/webhintio/hint/issues/3035)).

## Bug fixes / Improvements

* [[`a46488f6a3`](https://github.com/webhintio/hint/commit/a46488f6a3706920b2bdef63e085899707f23f7a)] - Fix: Improve performance of getElementByUrl (by [`Sorin Davidoi`](https://github.com/sorin-davidoi) / see also: [`#3073`](https://github.com/webhintio/hint/issues/3073)).

## Chores

* [[`99630d03dc`](https://github.com/webhintio/hint/commit/99630d03dc99cdb71a5010095a22b6908b6cdea5)] - Chore: Fix dependencies (by [`Antón Molleda`](https://github.com/molant)).
* [[`cdaa672fb1`](https://github.com/webhintio/hint/commit/cdaa672fb1ad081ee224aa339d2a48d468259061)] - Upgrade: Bump mdn-browser-compat-data from 0.0.95 to 0.0.96 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`a1b619b18b`](https://github.com/webhintio/hint/commit/a1b619b18b873da1cd16ae8565bbe5f461ce5d79)] - Upgrade: Bump applicationinsights from 1.4.2 to 1.5.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`cf459099a6`](https://github.com/webhintio/hint/commit/cf459099a63788a4bd0e644ffd7b7021b2bf9e45)] - Chore: Linting issues (by [`Antón Molleda`](https://github.com/molant)).
* [[`995c967b64`](https://github.com/webhintio/hint/commit/995c967b64afbeecb5a4e4adf40179a416b4ee93)] - Upgrade: Bump eslint from 5.16.0 to 6.5.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview) / see also: [`#3092`](https://github.com/webhintio/hint/issues/3092)).
* [[`abf0eab91a`](https://github.com/webhintio/hint/commit/abf0eab91a2436095d345aa1b0fabd6cdfa0e548)] - Upgrade: Bump is-wsl from 2.1.0 to 2.1.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`aaba5ba78d`](https://github.com/webhintio/hint/commit/aaba5ba78d143fa457c634a03ef5e2b97c249b57)] - Upgrade: Bump mdn-browser-compat-data from 0.0.94 to 0.0.95 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`8ca4cb8b35`](https://github.com/webhintio/hint/commit/8ca4cb8b352da6f7aa0d5972aed988e7aee7224e)] - Upgrade: Bump npm-registry-fetch from 4.0.0 to 5.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`3d1d193e34`](https://github.com/webhintio/hint/commit/3d1d193e34ec7611f439223664dd6d0556360787)] - Upgrade: Bump mdn-browser-compat-data from 0.0.93 to 0.0.94 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 5.0.2 (September 26, 2019)

## Bug fixes / Improvements

* [[`61b3d666f2`](https://github.com/webhintio/hint/commit/61b3d666f2a245f3b8278333e972c508edc9451a)] - Fix: Disallow simple names as filesystem paths (by [`Tony Ross`](https://github.com/antross) / see also: [`#3030`](https://github.com/webhintio/hint/issues/3030)).


# 5.0.1 (September 24, 2019)

## Chores

* [[`c8fc30b71a`](https://github.com/webhintio/hint/commit/c8fc30b71a7782c9128edcc5f467c7f96641be23)] - Upgrade: Bump file-type from 12.2.0 to 12.3.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`13da907c26`](https://github.com/webhintio/hint/commit/13da907c2617f71f0c9412bb2c05dfaed8a9fe23)] - Upgrade: Bump postcss from 7.0.17 to 7.0.18 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 5.0.0 (September 19, 2019)

## Breaking Changes

* [[`2ec983b7a3`](https://github.com/webhintio/hint/commit/2ec983b7a336ec2cbf1bc418f7e55d92a2542783)] - Breaking: `chromium-finder` defaults to Linux when running on WSL (by [`Antón Molleda`](https://github.com/molant)).

## Bug fixes / Improvements

* [[`9f8af13472`](https://github.com/webhintio/hint/commit/9f8af134727a795379e004c163598315a2537f64)] - Fix: Refactor telemetry events logic (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2962`](https://github.com/webhintio/hint/issues/2962)).

## New features

* [[`ce0addd3cb`](https://github.com/webhintio/hint/commit/ce0addd3cbd0e29df3059424b9281bd5d18fa063)] - New: Suggest alternate support when available (by [`Tony Ross`](https://github.com/antross) / see also: [`#2644`](https://github.com/webhintio/hint/issues/2644)).
* [[`5bab286a86`](https://github.com/webhintio/hint/commit/5bab286a8691bb6ca172b2494347c8ce93c70261)] - New: Add helpers to get browser names and support details (by [`Tony Ross`](https://github.com/antross)).

## Chores

* [[`0d3a13c722`](https://github.com/webhintio/hint/commit/0d3a13c722ebe89eea1378f7276d30f350924f87)] - Upgrade: Bump @types/debug from 4.1.4 to 4.1.5 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`c5e66947d4`](https://github.com/webhintio/hint/commit/c5e66947d494771b487c5d45a477069c61c9ed0b)] - Upgrade: Bump typescript from 3.6.2 to 3.6.3 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 4.1.1 (September 11, 2019)

## Bug fixes / Improvements

* [[`5603617df9`](https://github.com/webhintio/hint/commit/5603617df96def7c2571c8e94d595b76ec4633ec)] - Fix: Reference correct package directory in monorepo (by [`Tony Ross`](https://github.com/antross) / see also: [`#2873`](https://github.com/webhintio/hint/issues/2873)).
* [[`9493b6e172`](https://github.com/webhintio/hint/commit/9493b6e1723cbcc630cc28d5d8f75b59df17299d)] - Fix: Parameter isAppCrashing in sendPendingData defaults to false (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2878`](https://github.com/webhintio/hint/issues/2878)).

## Chores

* [[`83039130c4`](https://github.com/webhintio/hint/commit/83039130c445b550a3cf51eb6876028ed111a76b)] - Upgrade: Bump @types/semver from 6.0.1 to 6.0.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`4d79bf84b2`](https://github.com/webhintio/hint/commit/4d79bf84b2075459ef359cd9a5a27b0edd9e4be9)] - Upgrade: Bump @types/request from 2.48.2 to 2.48.3 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`6a52ef4fb5`](https://github.com/webhintio/hint/commit/6a52ef4fb50931921be5da4c4cacd8760a3de887)] - Upgrade: Bump rimraf from 2.6.3 to 3.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`372da26e10`](https://github.com/webhintio/hint/commit/372da26e1045ee1c9c45df9eee4aebd63abc223e)] - Upgrade: Bump mdn-browser-compat-data from 0.0.92 to 0.0.93 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`f3c69a5934`](https://github.com/webhintio/hint/commit/f3c69a5934cce2db04ba5e105347ca9681f27f33)] - Upgrade: Bump applicationinsights from 1.4.1 to 1.4.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`bbe99e3292`](https://github.com/webhintio/hint/commit/bbe99e329240a17e5f60c6c6261b0b9c2bd1774a)] - Upgrade: Bump typescript from 3.5.3 to 3.6.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`8f6939fe8f`](https://github.com/webhintio/hint/commit/8f6939fe8f6aa87e265f3a25bc79d7c226eb9e41)] - Upgrade: Bump mdn-browser-compat-data from 0.0.91 to 0.0.92 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`aab7643c70`](https://github.com/webhintio/hint/commit/aab7643c70042a5e7d2da9684844277d707854fe)] - Upgrade: Bump sinon from 7.3.2 to 7.4.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`9c320e1fa3`](https://github.com/webhintio/hint/commit/9c320e1fa3d832e5937d7867e92b70d268be6086)] - Upgrade: Bump npm-registry-fetch from 3.9.1 to 4.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`e3dafa8657`](https://github.com/webhintio/hint/commit/e3dafa8657e0f0f737c0557b7f0c41d10c5f0137)] - Chore: Fix type inconsistency affecting extension-vscode builds (by [`Tony Ross`](https://github.com/antross)).


# 4.1.0 (August 29, 2019)

## Bug fixes / Improvements

* [[`d01eb29b7e`](https://github.com/webhintio/hint/commit/d01eb29b7ee9ea385252fc2a35f2cd93ffb88fc2)] - Fix: Method file-extension to support relative URLs (by [`Jesus David García Gomez`](https://github.com/sarvaje)).

## New features

* [[`154eda8463`](https://github.com/webhintio/hint/commit/154eda8463175eba424c552016fccb96a45e5992)] - New: Add `parentElement` property to the `HTMLElement` class (by [`Jaspreet Singh`](https://github.com/jaspreet57)).

## Chores

* [[`2048485aff`](https://github.com/webhintio/hint/commit/2048485affe6af0cd8cc48f03f7a3f62398bf330)] - Upgrade: Bump mdn-browser-compat-data from 0.0.88 to 0.0.91 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`2835406ca7`](https://github.com/webhintio/hint/commit/2835406ca7db6ca4926b6d55f15ee84f96f98748)] - Upgrade: Bump jsonc-parser from 2.1.0 to 2.1.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`dc17c7661b`](https://github.com/webhintio/hint/commit/dc17c7661bc8564467a3bde1b4e2c0dbebfcb510)] - Upgrade: Bump lodash from 4.17.14 to 4.17.15 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`acdc82165d`](https://github.com/webhintio/hint/commit/acdc82165d85a49f2aa275db09bb742afef67b97)] - Upgrade: Bump file-type from 12.1.0 to 12.2.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`72b18d08b2`](https://github.com/webhintio/hint/commit/72b18d08b27a785e3070d1278ec059fbf119e862)] - Upgrade: Bump applicationinsights from 1.4.0 to 1.4.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 4.0.0 (August 15, 2019)

## Breaking Changes

* [[`5be6e93192`](https://github.com/webhintio/hint/commit/5be6e93192014ae35aac615cce8c33889d971dde)] - Breaking: Use __dirname to find the locale file. (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2794`](https://github.com/webhintio/hint/issues/2794)).

## Bug fixes / Improvements

* [[`23300153b8`](https://github.com/webhintio/hint/commit/23300153b8798bc10e70e0e1ab96eed35ccef069)] - Fix: Error building create-hint release package (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2819`](https://github.com/webhintio/hint/issues/2819)).

## New features

* [[`459ee2284c`](https://github.com/webhintio/hint/commit/459ee2284c92e9482b27cb2527fc16b04e8ee7f0)] - New: Add utils to get all hints from a configuration, including extends (by [`Jesus David García Gomez`](https://github.com/sarvaje)).

## Chores

* [[`fa170b5323`](https://github.com/webhintio/hint/commit/fa170b5323df88c7119a6d5c9f1b4c4caa4039a9)] - Upgrade: Bump postcss-value-parser from 4.0.0 to 4.0.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`351eaa5e02`](https://github.com/webhintio/hint/commit/351eaa5e02b5a7e5e79de7163b636fc89690fbe5)] - Chore: Move `load-resource` and its dependencies to `utils` (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2797`](https://github.com/webhintio/hint/issues/2797)).


# 3.1.2 (August 6, 2019)

## Chores

* [[`7b3d1fe737`](https://github.com/webhintio/hint/commit/7b3d1fe737559e01b9ff5e486341e88e4b705726)] - Upgrade: Bump mdn-browser-compat-data from 0.0.87 to 0.0.88 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 3.1.1 (July 30, 2019)

## Bug fixes / Improvements

* [[`79ee648fec`](https://github.com/webhintio/hint/commit/79ee648fecc7be6939fe1ffe0f6dcd27c084a54d)] - Fix: Move packages included in exported types to `dependencies` (by [`Tony Ross`](https://github.com/antross) / see also: [`#2732`](https://github.com/webhintio/hint/issues/2732)).

## Chores

* [[`bd8499a953`](https://github.com/webhintio/hint/commit/bd8499a953ef8371e0e8ddc1f2fdc6c31c76ceab)] - Upgrade: Bump mdn-browser-compat-data from 0.0.86 to 0.0.87 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`d10b4ec7b0`](https://github.com/webhintio/hint/commit/d10b4ec7b04d5aca9f8334165fe1303d3914af5d)] - Upgrade: Bump semver from 6.2.0 to 6.3.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`201e80b1bb`](https://github.com/webhintio/hint/commit/201e80b1bb0e9086ab477bf9e901d279ab3b89c9)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.12.0 to 1.13.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`2d2b70ef33`](https://github.com/webhintio/hint/commit/2d2b70ef33438a341b32aab6e8eb3e0d999286c8)] - Upgrade: Bump file-type from 12.0.1 to 12.1.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`e60d4af8c2`](https://github.com/webhintio/hint/commit/e60d4af8c27f374e15761e9f57f91509ad7d92ac)] - Upgrade: Bump @types/parse5 from 5.0.1 to 5.0.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`6a80bb3bc6`](https://github.com/webhintio/hint/commit/6a80bb3bc6b517d7463a3884757aacbaf00d53af)] - Upgrade: Bump eslint-plugin-import from 2.18.0 to 2.18.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 3.1.0 (July 24, 2019)

## New features

* [[`b68b7386c7`](https://github.com/webhintio/hint/commit/b68b7386c742fc4c0c9fc8f1b064791a412c0a95)] - New: Add Localization to formatter-html (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2710`](https://github.com/webhintio/hint/issues/2710)).


# 3.0.0 (July 23, 2019)

## Breaking Changes

* [[`e642c9dbfb`](https://github.com/webhintio/hint/commit/e642c9dbfbeefba1ebc500b5f8edb73f9b602038)] - Breaking: Add `resolveUrl` to `HTMLDocument` and `HTMLElement` (by [`Jesus David García Gomez`](https://github.com/sarvaje)).
* [[`08a33bd4d2`](https://github.com/webhintio/hint/commit/08a33bd4d22a0be257a123d929aea341e45a3fd8)] - Breaking: Refactor and streamline hint-compat-api (by [`Tony Ross`](https://github.com/antross) / see also: [`#2114`](https://github.com/webhintio/hint/issues/2114), [`#2516`](https://github.com/webhintio/hint/issues/2516), and [`#2518`](https://github.com/webhintio/hint/issues/2518)).

## Bug fixes / Improvements

* [[`5cd68cd0eb`](https://github.com/webhintio/hint/commit/5cd68cd0eb3f768db4bd3e4e3f8425afac168bc2)] - Fix: Improve formatting for CSS code snippets (by [`Tony Ross`](https://github.com/antross) / see also: [`#2597`](https://github.com/webhintio/hint/issues/2597)).
* [[`fc10faa0bf`](https://github.com/webhintio/hint/commit/fc10faa0bf05981f97f27b7da1ce0cd18061d430)] - Fix: Minor issues querying MDN browser compat data (by [`Tony Ross`](https://github.com/antross)).

## New features

* [[`c0898120c1`](https://github.com/webhintio/hint/commit/c0898120c1d0cb2f6760814e687605aba45175be)] - New: Make CLI, hints, and formatters localizable (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2620`](https://github.com/webhintio/hint/issues/2620)).
* [[`b35926c68a`](https://github.com/webhintio/hint/commit/b35926c68a6ec4dcd3312d06600a004b2b67417e)] - New: Add `getSupported` compat helper API (by [`Tony Ross`](https://github.com/antross)).
* [[`5fcbb12d6a`](https://github.com/webhintio/hint/commit/5fcbb12d6a0cf9387366db608d5eb843cff35601)] - New: Util to merge process.env with an options object (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2500`](https://github.com/webhintio/hint/issues/2500)).
* [[`3ba6b22e9b`](https://github.com/webhintio/hint/commit/3ba6b22e9b07a5cef83a9190514ace0718cdcde5)] - New: Find Edge on macOS (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2476`](https://github.com/webhintio/hint/issues/2476)).

## Chores

* [[`036bd3312b`](https://github.com/webhintio/hint/commit/036bd3312b9513d1e93eaeea6fac1bcd917d064f)] - Chore: Migrate more utilities from hint to @hint/utils (by [`Tony Ross`](https://github.com/antross) / see also: [`#2703`](https://github.com/webhintio/hint/issues/2703)).
* [[`fe62c2058f`](https://github.com/webhintio/hint/commit/fe62c2058f17b57a4a415a43c3093b0cb5456d24)] - Upgrade: Bump semver from 6.1.2 to 6.2.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`aa388341c9`](https://github.com/webhintio/hint/commit/aa388341c9ef09878892436f0fc1c4061e606e9d)] - Upgrade: Bump @types/parse5 from 5.0.0 to 5.0.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`31def165bc`](https://github.com/webhintio/hint/commit/31def165bc3dcfca6e1fadcd2048310935c434e3)] - Upgrade: Bump mdn-browser-compat-data from 0.0.84 to 0.0.86 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`622dcbb407`](https://github.com/webhintio/hint/commit/622dcbb40758c9f9033680056d0201fde71a8ee6)] - Upgrade: Bump @typescript-eslint/parser from 1.10.2 to 1.12.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`bf33fb1365`](https://github.com/webhintio/hint/commit/bf33fb1365c5c4ead9e0ec9ce658129c09d1f92d)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.11.0 to 1.12.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`4b54156479`](https://github.com/webhintio/hint/commit/4b54156479d8bcb415945544d4561a0162e2694e)] - Upgrade: [Security] Bump lodash from 4.17.11 to 4.17.13 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview) / see also: [`#2676`](https://github.com/webhintio/hint/issues/2676)).
* [[`355fdfbcdc`](https://github.com/webhintio/hint/commit/355fdfbcdc4634c4985e765a060f23574c77658a)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.10.2 to 1.11.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`6a06455ba0`](https://github.com/webhintio/hint/commit/6a06455ba0c4685b79a0c69437a8c6243d3d850a)] - Upgrade: Bump ajv from 6.10.0 to 6.10.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`24c9ec8e76`](https://github.com/webhintio/hint/commit/24c9ec8e76d49d2fa459e47e50735bb8825736e7)] - Upgrade: Bump npm-registry-fetch from 3.9.0 to 3.9.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`f5b23ed7e9`](https://github.com/webhintio/hint/commit/f5b23ed7e9c308ad8ef030f05db8512369c8e860)] - Upgrade: Bump is-wsl from 2.0.0 to 2.1.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`73662175a9`](https://github.com/webhintio/hint/commit/73662175a90d290c8799c98bbe787853c31ce8c8)] - Upgrade: Bump @types/semver from 6.0.0 to 6.0.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`72fecbed29`](https://github.com/webhintio/hint/commit/72fecbed29ca19936d7ad5e57925f44c4339d7af)] - Upgrade: Bump semver from 6.1.1 to 6.1.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`7d0f594c5a`](https://github.com/webhintio/hint/commit/7d0f594c5aedee2e3c6602005ac8b85bda5565b0)] - Upgrade: Bump configstore from 4.0.0 to 5.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`e58b635c43`](https://github.com/webhintio/hint/commit/e58b635c43b912527d03aade98d07e036f11276d)] - Upgrade: Bump mdn-browser-compat-data from 0.0.83 to 0.0.84 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`8bd2b6e6f0`](https://github.com/webhintio/hint/commit/8bd2b6e6f06fed428ed5b36e27ae7393934f8aeb)] - Upgrade: Bump file-type from 11.1.0 to 12.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`da6b295de9`](https://github.com/webhintio/hint/commit/da6b295de91c3a7667479cf4858cc8e4d01ce515)] - Upgrade: Bump mdn-browser-compat-data from 0.0.82 to 0.0.83 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`d0b50953a5`](https://github.com/webhintio/hint/commit/d0b50953a58d06b71c5a86a24ba1f58b8451e9c7)] - Upgrade: Bump @typescript-eslint/parser from 1.9.0 to 1.10.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`a1068ac463`](https://github.com/webhintio/hint/commit/a1068ac463ef63bc38b6c9294d63cb84a3969a25)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.9.0 to 1.10.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`8a52673647`](https://github.com/webhintio/hint/commit/8a5267364716f07f72ae0abd6d474500df8b6204)] - Upgrade: Bump postcss from 7.0.16 to 7.0.17 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`1cbdd7958b`](https://github.com/webhintio/hint/commit/1cbdd7958b81e40f032c3a0f0b152e30abd186b8)] - Upgrade: Bump mdn-browser-compat-data from 0.0.81 to 0.0.82 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`865b78b01f`](https://github.com/webhintio/hint/commit/865b78b01f48a7a9ba1407f847fd376739bb2897)] - Upgrade: Bump applicationinsights from 1.3.1 to 1.4.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`99d530159e`](https://github.com/webhintio/hint/commit/99d530159e7f9f457bc6f7804a10ae7b502607bb)] - Upgrade: Bump postcss-value-parser from 3.3.1 to 4.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`67a656aa93`](https://github.com/webhintio/hint/commit/67a656aa936d4b37f2c50b5eb9aa0494778bf542)] - Upgrade: Bump typescript from 3.4.5 to 3.5.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview) / see also: [`#2529`](https://github.com/webhintio/hint/issues/2529)).
* [[`aec9bbc812`](https://github.com/webhintio/hint/commit/aec9bbc8124d313985c04bbbbe45cf7de633d6ed)] - Upgrade: Bump is-svg from 4.1.0 to 4.2.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`5f4634568e`](https://github.com/webhintio/hint/commit/5f4634568eb2ce8fe0a3a5b2caea4064539a1b3e)] - Upgrade: Bump semver from 6.1.0 to 6.1.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`6ac7ee2246`](https://github.com/webhintio/hint/commit/6ac7ee2246b4397c91762581f37358055d2527b8)] - Upgrade: Bump jsdom from 15.1.0 to 15.1.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`557a8554de`](https://github.com/webhintio/hint/commit/557a8554de588527f8a75695c0946b86589c713e)] - Upgrade: Bump eslint-plugin-import from 2.17.2 to 2.17.3 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`5e6087594d`](https://github.com/webhintio/hint/commit/5e6087594d4be0edac67b1ee7d7e125cd82ebe00)] - Upgrade: Bump mdn-browser-compat-data from 0.0.80 to 0.0.81 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`e14720cff1`](https://github.com/webhintio/hint/commit/e14720cff139bb6683533a44893202ca50856520)] - Upgrade: Bump file-type from 11.0.0 to 11.1.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`ffd441b15f`](https://github.com/webhintio/hint/commit/ffd441b15f02f66b9468f90726e53d5b17345a4f)] - Chore: Increase coverage (by [`Antón Molleda`](https://github.com/molant)).


# 2.1.0 (May 23, 2019)

## Bug fixes / Improvements

* [[`7db6ffa11b`](https://github.com/webhintio/hint/commit/7db6ffa11bb6e7c776b3fa7f06cddae62fd4a3be)] - Fix: Error handling improvements (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2431`](https://github.com/webhintio/hint/issues/2431), and [`#2442`](https://github.com/webhintio/hint/issues/2442)).
* [[`86a94d14ae`](https://github.com/webhintio/hint/commit/86a94d14aecad979db3d8c77a39da4b38fe9c859)] - Fix: Use `string enum` for `Browser` (by [`Antón Molleda`](https://github.com/molant)).
* [[`882cc81a1b`](https://github.com/webhintio/hint/commit/882cc81a1b3c806390452c7ab18857c260a48512)] - Fix: Missing and extra dependencies (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2375`](https://github.com/webhintio/hint/issues/2375)).
* [[`4ab29f7765`](https://github.com/webhintio/hint/commit/4ab29f7765f3bb4b77a4ebfa3d6ac45253a6085a)] - Fix: Snapshot template element content as children (by [`Tony Ross`](https://github.com/antross) / see also: [`#2427`](https://github.com/webhintio/hint/issues/2427)).

## New features

* [[`bbce68a7e2`](https://github.com/webhintio/hint/commit/bbce68a7e2fa2131f8e4cc0a57814581e27491fd)] - New: Connector `puppeteer` (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2248`](https://github.com/webhintio/hint/issues/2248), and [`#2419`](https://github.com/webhintio/hint/issues/2419)).
* [[`0a403073d1`](https://github.com/webhintio/hint/commit/0a403073d1898ff8b0280b7a35af7d629233c3c2)] - New: Flatten `chromiumFinder` to root (by [`Antón Molleda`](https://github.com/molant)).
* [[`d8832aafe5`](https://github.com/webhintio/hint/commit/d8832aafe5137168d7993a6d3de42b00cc1af67d)] - New: Support yarn for installing .hintrc packages (by [`Shivang Tripathi`](https://github.com/shivangg) / see also: [`#1630`](https://github.com/webhintio/hint/issues/1630)).

## Chores

* [[`18e6021203`](https://github.com/webhintio/hint/commit/18e60212036e0243942814879a9f33751eb582c3)] - Upgrade: Bump semver from 5.7.0 to 6.1.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`71ffb3ad3b`](https://github.com/webhintio/hint/commit/71ffb3ad3b2a76c1c1b0629c406f15956a46847d)] - Chore: Drop unnecessary types (by [`Tony Ross`](https://github.com/antross)).
* [[`313cce5742`](https://github.com/webhintio/hint/commit/313cce5742c8d6ff855aafe563c72b8e9b7bfb5f)] - Chore: Repurpose `test-release` script (by [`Antón Molleda`](https://github.com/molant)).
* [[`3e6dea7450`](https://github.com/webhintio/hint/commit/3e6dea7450eb0a96ee6f5474239da2c60215006a)] - Upgrade: Bump mdn-browser-compat-data from 0.0.79 to 0.0.80 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`aab9913543`](https://github.com/webhintio/hint/commit/aab9913543d9a09fc8ccb0e0c7dc8b2f2ee35ed6)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.7.0 to 1.9.0 (by [`Dependabot`](https://github.com/dependabot-bot)).


# 1.0.0 (May 14, 2019)

## Breaking Changes

* [[`bfe3edd9e8`](https://github.com/webhintio/hint/commit/bfe3edd9e8984344c1e7965d39b0de4193e52a4f)] - Breaking: Drop interoperability category (by [`Tony Ross`](https://github.com/antross)).
* [[`74f0b67a25`](https://github.com/webhintio/hint/commit/74f0b67a250eba7638d670bb6d40c3760ddd0ca5)] - Breaking: Replace `caniuse` util with a `compat` util based on MDN data (by [`Tony Ross`](https://github.com/antross) / see also: [`#2296`](https://github.com/webhintio/hint/issues/2296)).
* [[`a01fbca4f0`](https://github.com/webhintio/hint/commit/a01fbca4f09b6de97edc698839d64910cb40f76a)] - Breaking: Move `content-type` util from `hint` to `@hint/utils` (by [`Tony Ross`](https://github.com/antross)).
* [[`f3583a2cf8`](https://github.com/webhintio/hint/commit/f3583a2cf8c8a93c0ad726803d7211f7b1383b2b)] - Breaking: Refactor DOM utils inside hint to `@hint/utils` (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2192`](https://github.com/webhintio/hint/issues/2192)).
* [[`09c5383540`](https://github.com/webhintio/hint/commit/09c5383540d207e1b1a1a96cf17a0a32c51ea946)] - Breaking: Remove `utils` in favor of `@hint/utils` (by [`Jesus David García Gomez`](https://github.com/sarvaje)).

## Bug fixes / Improvements

* [[`1e63138d05`](https://github.com/webhintio/hint/commit/1e63138d05e668cee88b02ea3ed47b016987fd8d)] - Fix: Include element reference when no location is available (by [`Tony Ross`](https://github.com/antross)).
* [[`d7ccb2f61b`](https://github.com/webhintio/hint/commit/d7ccb2f61b08aaf64e46127e5f355474e207bec7)] - Fix: Handle malformed CSS selectors (by [`Tony Ross`](https://github.com/antross)).
* [[`b988b212d8`](https://github.com/webhintio/hint/commit/b988b212d8e08b1c4e5b5a005d053966d2b5cfe1)] - Fix: Trim source snippets auto-generated from element references (by [`Tony Ross`](https://github.com/antross) / see also: [`#2211`](https://github.com/webhintio/hint/issues/2211)).
* [[`e7807b4e65`](https://github.com/webhintio/hint/commit/e7807b4e65c389164d45196356770dafc545615a)] - Fix: Make snapshot resilient to prototype overrides (by [`Tony Ross`](https://github.com/antross)).
* [[`b7b4866def`](https://github.com/webhintio/hint/commit/b7b4866def7a5bad3cddcb05b49a51b0c5b52bec)] - Fix: Error location for HTTP headers and added code snippet (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2209`](https://github.com/webhintio/hint/issues/2209)).
* [[`db4582a963`](https://github.com/webhintio/hint/commit/db4582a963ab54c1244da91ee2413581262f1998)] - Fix: Include source code snippets in `hint-compat-api` (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2210`](https://github.com/webhintio/hint/issues/2210)).
* [[`2dfb338234`](https://github.com/webhintio/hint/commit/2dfb3382347cd264561adc378d6c73972bd1bae6)] - Fix: Review pinned version of packages (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2025`](https://github.com/webhintio/hint/issues/2025)).

## New features

* [[`a17d29aac9`](https://github.com/webhintio/hint/commit/a17d29aac9bcd31fe640547efc8f2e785eaea5a4)] - New: Add `schema-validation` and `json-parser`  to utils (by [`Antón Molleda`](https://github.com/molant)).
* [[`4ca99b14e8`](https://github.com/webhintio/hint/commit/4ca99b14e86e4c9550b2af7564cbfc1fbdf30440)] - New: Util `chromium-finder` (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2260`](https://github.com/webhintio/hint/issues/2260)).
* [[`0edaba4b16`](https://github.com/webhintio/hint/commit/0edaba4b16425d9ac1051e673c8ed9e7abfbcc02)] - New: Add a snapshot utility (by [`Tony Ross`](https://github.com/antross)).
* [[`d934aeb9b7`](https://github.com/webhintio/hint/commit/d934aeb9b714a7ddcaf1d09a3790348eaa4c335b)] - New: Node.js API (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1532`](https://github.com/webhintio/hint/issues/1532)).

## Chores

* [[`21c109eda4`](https://github.com/webhintio/hint/commit/21c109eda4012476b7dd46211dfb394d13af7723)] - Chore: Make package public (by [`Antón Molleda`](https://github.com/molant)).
* [[`cf6de67b72`](https://github.com/webhintio/hint/commit/cf6de67b72cdc4d95cc56b205a1375da2c5dfd61)] - Upgrade: Bump mdn-browser-compat-data from 0.0.78 to 0.0.79 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`950440e85d`](https://github.com/webhintio/hint/commit/950440e85db027850324f44fd046efaf5b1a4af0)] - Upgrade: Bump @types/strip-bom from 3.0.0 to 4.0.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`e295ea2113`](https://github.com/webhintio/hint/commit/e295ea21135d129c032dc9fc636cb22f1a15e07c)] - Upgrade: Bump postcss from 7.0.15 to 7.0.16 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`072e92501e`](https://github.com/webhintio/hint/commit/072e92501e89e60c3606b393afc7be83693d1012)] - Upgrade: Bump postcss from 7.0.14 to 7.0.15 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`0f70f6f773`](https://github.com/webhintio/hint/commit/0f70f6f773235cdab31d5811eaa5f0ff9be9650f)] - Upgrade: Bump nyc from 14.0.0 to 14.1.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`a80a6d7aa9`](https://github.com/webhintio/hint/commit/a80a6d7aa93619b35ef68c45b2881e3258ea7efb)] - Upgrade: Bump mdn-browser-compat-data from 0.0.77 to 0.0.78 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`6301f4e9fa`](https://github.com/webhintio/hint/commit/6301f4e9fad5177d8d48bb41373d2b486a6c78ae)] - Upgrade: Bump mdn-browser-compat-data from 0.0.76 to 0.0.77 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`91d1dc8264`](https://github.com/webhintio/hint/commit/91d1dc82640d606261bca4f772e5b39c95333738)] - Upgrade: Bump strip-json-comments from 3.0.0 to 3.0.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`cd2e49837c`](https://github.com/webhintio/hint/commit/cd2e49837c5aa1e68e4f2fdc91bc2b731b260a21)] - Upgrade: Bump strip-json-comments from 2.0.1 to 3.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`232030d854`](https://github.com/webhintio/hint/commit/232030d854ac004d6572908a05f5c1d712c28580)] - Upgrade: Bump strip-bom from 3.0.0 to 4.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`38b698bdc9`](https://github.com/webhintio/hint/commit/38b698bdc96bebe8d7dabed8c2df115de06da67c)] - Upgrade: Bump is-wsl from 1.1.0 to 2.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`2075b77ab1`](https://github.com/webhintio/hint/commit/2075b77ab1b05aadc51329261df3fbc9d83cc09e)] - Upgrade: Bump typescript from 3.4.4 to 3.4.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`15aeb57f27`](https://github.com/webhintio/hint/commit/15aeb57f2753dce8e6b7c78a9cc5c5376a538835)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.6.0 to 1.7.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`7c89c54dc0`](https://github.com/webhintio/hint/commit/7c89c54dc035641db905a2d057dc2ba04af09eb1)] - Upgrade: Bump @typescript-eslint/parser from 1.6.0 to 1.7.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`b7a588d442`](https://github.com/webhintio/hint/commit/b7a588d442233484c5ffdff41865761213b4121a)] - Upgrade: Bump typescript from 3.4.3 to 3.4.4 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c8f87f8cb3`](https://github.com/webhintio/hint/commit/c8f87f8cb3318ef0abf1259e7a78f920c2f6701e)] - Upgrade: Bump eslint-plugin-import from 2.16.0 to 2.17.2 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`83510aecf9`](https://github.com/webhintio/hint/commit/83510aecf9657aadbc987ae7ad66603a1da1e8e0)] - Upgrade: Bump nyc from 13.3.0 to 14.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`aae4a30c02`](https://github.com/webhintio/hint/commit/aae4a30c02a0635328d98589a6020ec0a27f4579)] - Chore: Reference elements from snapshots in reports (by [`Tony Ross`](https://github.com/antross)).
* [[`95afd628a6`](https://github.com/webhintio/hint/commit/95afd628a65af40a318f39c944dd358753b1c2ed)] - Chore: Remove `@types/file-url` and update `import` (by [`Antón Molleda`](https://github.com/molant)).
* [[`549bd320b5`](https://github.com/webhintio/hint/commit/549bd320b5f01b8ab934c2c819c7797a9ea51476)] - Chore: Trim `mime-db` data (by [`Tony Ross`](https://github.com/antross) / see also: [`#2099`](https://github.com/webhintio/hint/issues/2099)).
* [[`328bd08842`](https://github.com/webhintio/hint/commit/328bd0884273c25294509f85b95467930eaebb9e)] - Upgrade: Bump file-url from 2.0.2 to 3.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`953805390a`](https://github.com/webhintio/hint/commit/953805390a84c1d28447d57a06e58cf88da375ed)] - Upgrade: Bump @types/debug from 4.1.3 to 4.1.4 (by [`Dependabot`](https://github.com/dependabot-bot)).


