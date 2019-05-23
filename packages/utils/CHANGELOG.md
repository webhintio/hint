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


