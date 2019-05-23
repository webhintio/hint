# 3.0.2 (May 23, 2019)

## Chores

* [[`313cce5742`](https://github.com/webhintio/hint/commit/313cce5742c8d6ff855aafe563c72b8e9b7bfb5f)] - Chore: Repurpose `test-release` script (by [`Antón Molleda`](https://github.com/molant)).
* [[`54431c8fdd`](https://github.com/webhintio/hint/commit/54431c8fdd2dbdec89859cb5c18a2509488b3335)] - Chore: Ignore tests in Puppeteer always (by [`Antón Molleda`](https://github.com/molant)).
* [[`aab9913543`](https://github.com/webhintio/hint/commit/aab9913543d9a09fc8ccb0e0c7dc8b2f2ee35ed6)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.7.0 to 1.9.0 (by [`Dependabot`](https://github.com/dependabot-bot)).


# 3.0.0 (May 14, 2019)

## Breaking Changes

* [[`f3583a2cf8`](https://github.com/webhintio/hint/commit/f3583a2cf8c8a93c0ad726803d7211f7b1383b2b)] - Breaking: Refactor DOM utils inside hint to `@hint/utils` (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2192`](https://github.com/webhintio/hint/issues/2192)).

## Bug fixes / Improvements

* [[`db4582a963`](https://github.com/webhintio/hint/commit/db4582a963ab54c1244da91ee2413581262f1998)] - Fix: Include source code snippets in `hint-compat-api` (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2210`](https://github.com/webhintio/hint/issues/2210)).
* [[`2dfb338234`](https://github.com/webhintio/hint/commit/2dfb3382347cd264561adc378d6c73972bd1bae6)] - Fix: Review pinned version of packages (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2025`](https://github.com/webhintio/hint/issues/2025)).
* [[`16dcf04e0b`](https://github.com/webhintio/hint/commit/16dcf04e0b8de4b506ebf6050132a23658845030)] - Fix: Firefox support by replacing lookbehind regex (by [`Tony Ross`](https://github.com/antross) / see also: [`#2164`](https://github.com/webhintio/hint/issues/2164)).
* [[`0c5def3295`](https://github.com/webhintio/hint/commit/0c5def3295fedd5129178e5791c943fcbda2908c)] - Fix: Ignore @support block if @support or feature is not supported (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#1869`](https://github.com/webhintio/hint/issues/1869)).
* [[`36a8fab7be`](https://github.com/webhintio/hint/commit/36a8fab7be8978bd92b302a2de9b5a9b0bf26e2c)] - Fix: Update IAsync* references to use HTMLDocument/HTMLElement (by [`Jesus David García Gomez`](https://github.com/sarvaje)).

## New features

* [[`f8cbcef837`](https://github.com/webhintio/hint/commit/f8cbcef8379fa2b97c990fbfae6a74b13a4a6c8f)] - New: Add `utils` package (by [`Jesus David García Gomez`](https://github.com/sarvaje)).

## Chores

* [[`e295ea2113`](https://github.com/webhintio/hint/commit/e295ea21135d129c032dc9fc636cb22f1a15e07c)] - Upgrade: Bump postcss from 7.0.15 to 7.0.16 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`072e92501e`](https://github.com/webhintio/hint/commit/072e92501e89e60c3606b393afc7be83693d1012)] - Upgrade: Bump postcss from 7.0.14 to 7.0.15 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`907995d47e`](https://github.com/webhintio/hint/commit/907995d47ec7dcdee2e3f336f026f9901e55f291)] - Upgrade: Bump @types/node from 11.13.9 to 12.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`0f70f6f773`](https://github.com/webhintio/hint/commit/0f70f6f773235cdab31d5811eaa5f0ff9be9650f)] - Upgrade: Bump nyc from 14.0.0 to 14.1.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`8332a32710`](https://github.com/webhintio/hint/commit/8332a32710329a40a628d4e61286a0a5464fb11f)] - Upgrade: Bump @types/node from 11.13.8 to 11.13.9 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`f934c5af80`](https://github.com/webhintio/hint/commit/f934c5af80fedbdedc300597db126bbeb4df9016)] - Chore: Use packed MDN data from `@hint/utils` (by [`Tony Ross`](https://github.com/antross)).
* [[`60624562af`](https://github.com/webhintio/hint/commit/60624562af11362cf834f1791c6f3c1dfe84385d)] - Upgrade: Bump @types/node from 11.13.5 to 11.13.8 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`2075b77ab1`](https://github.com/webhintio/hint/commit/2075b77ab1b05aadc51329261df3fbc9d83cc09e)] - Upgrade: Bump typescript from 3.4.4 to 3.4.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`15aeb57f27`](https://github.com/webhintio/hint/commit/15aeb57f2753dce8e6b7c78a9cc5c5376a538835)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.6.0 to 1.7.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`7c89c54dc0`](https://github.com/webhintio/hint/commit/7c89c54dc035641db905a2d057dc2ba04af09eb1)] - Upgrade: Bump @typescript-eslint/parser from 1.6.0 to 1.7.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`b7a588d442`](https://github.com/webhintio/hint/commit/b7a588d442233484c5ffdff41865761213b4121a)] - Upgrade: Bump typescript from 3.4.3 to 3.4.4 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c119a3562d`](https://github.com/webhintio/hint/commit/c119a3562dd487b8e48f20c99ed27d37b92288a8)] - Upgrade: Bump @types/node from 11.13.4 to 11.13.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`83510aecf9`](https://github.com/webhintio/hint/commit/83510aecf9657aadbc987ae7ad66603a1da1e8e0)] - Upgrade: Bump nyc from 13.3.0 to 14.0.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`953805390a`](https://github.com/webhintio/hint/commit/953805390a84c1d28447d57a06e58cf88da375ed)] - Upgrade: Bump @types/debug from 4.1.3 to 4.1.4 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`3f591e798f`](https://github.com/webhintio/hint/commit/3f591e798f352ec47bab83e53ed548318688e51a)] - Upgrade: Bump typescript from 3.3.4000 to 3.4.3 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`48fdf0b446`](https://github.com/webhintio/hint/commit/48fdf0b4461fd8a6b0ba20574bcb5ceed8bd0d8c)] - Upgrade: Bump markdownlint-cli from 0.14.1 to 0.15.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`8425c1cfee`](https://github.com/webhintio/hint/commit/8425c1cfeefbca6014cc78a2486c4f5133a16e3e)] - Upgrade: Bump @types/debug from 4.1.2 to 4.1.3 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`f50942e1ac`](https://github.com/webhintio/hint/commit/f50942e1ac6658f9e4b333f7f3a7342ab98b48ea)] - Upgrade: Bump ava from 1.4.0 to 1.4.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c8eb30606a`](https://github.com/webhintio/hint/commit/c8eb30606a39c9175e1ec43a8d693d04ff5842d4)] - Upgrade: Bump ava from 1.3.1 to 1.4.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`cf01687635`](https://github.com/webhintio/hint/commit/cf0168763549e7ac3f02d3e406bec65bd9e96eb2)] - Upgrade: Bump @types/node from 11.11.8 to 11.12.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`039f1d3a32`](https://github.com/webhintio/hint/commit/039f1d3a32b989435ef408d69bae2dd9544b8fe0)] - Upgrade: Bump @types/node from 11.11.7 to 11.11.8 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`ecae90832d`](https://github.com/webhintio/hint/commit/ecae90832d40fb4270c13395ddd35e27acf8117f)] - Upgrade: Bump @types/node from 11.11.6 to 11.11.7 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`879d4b2c59`](https://github.com/webhintio/hint/commit/879d4b2c59ff8a4a58e547639624d3efc3e3e38b)] - Chore: Scope lodash imports to reduce browser extension size (by [`Tony Ross`](https://github.com/antross)).
* [[`8f376cdb11`](https://github.com/webhintio/hint/commit/8f376cdb1154708693d1e8520859f5c63f3bcdd4)] - Upgrade: Bump markdownlint-cli from 0.14.0 to 0.14.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`ae52a5e661`](https://github.com/webhintio/hint/commit/ae52a5e661ebd06ffdcd73d4cdcdc30bda62ac8d)] - Upgrade: Bump @types/node from 11.11.5 to 11.11.6 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`3f94789dca`](https://github.com/webhintio/hint/commit/3f94789dcaf69db0047858becd18e1aedf406dcd)] - Upgrade: Bump typescript from 3.3.3333 to 3.3.4000 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`4e8c353d05`](https://github.com/webhintio/hint/commit/4e8c353d05da6d2ef0e8db7b5ca8accfb0c27a16)] - Upgrade: Bump @types/node from 11.11.4 to 11.11.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`a153b6c6f7`](https://github.com/webhintio/hint/commit/a153b6c6f7698b35bfc27b2568178bb98099e228)] - Chore: Ignore `chrome` on CI (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2031`](https://github.com/webhintio/hint/issues/2031)).
* [[`938a4c87fb`](https://github.com/webhintio/hint/commit/938a4c87fb47a699f2691ceae5bb107a30aebda3)] - Upgrade: Bump mdn-browser-compat-data from 0.0.70 to 0.0.72 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`c38104cdd9`](https://github.com/webhintio/hint/commit/c38104cdd92e12c1395d704a4271cfa23fb18727)] - Upgrade: Bump @types/node from 11.11.3 to 11.11.4 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`ae5124479d`](https://github.com/webhintio/hint/commit/ae5124479d63d9d4bdafa0cac211eb2857485f50)] - Chore: Refactor location tests to match similar text (by [`Tony Ross`](https://github.com/antross)).
* [[`4ad0ea4187`](https://github.com/webhintio/hint/commit/4ad0ea41871335a9958df710e4dba33f92e301a8)] - Chore: Fix report positions in tests (by [`Tony Ross`](https://github.com/antross)).
* [[`5859e56f8e`](https://github.com/webhintio/hint/commit/5859e56f8e14944a0bd130c8abeecb822622ccf3)] - Upgrade: Bump @types/node from 11.11.1 to 11.11.3 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`b3f3d412b6`](https://github.com/webhintio/hint/commit/b3f3d412b603b0bf7e2e290ab3614e24acf2d277)] - Upgrade: Bump @types/node from 11.11.0 to 11.11.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`d82afffe66`](https://github.com/webhintio/hint/commit/d82afffe6668e81e6903e7a130daa07d730afb91)] - Upgrade: Bump @types/node from 11.10.5 to 11.11.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`12d9b851f4`](https://github.com/webhintio/hint/commit/12d9b851f4afcfce693806df35d37c36684c35d8)] - Chore: Update 'parser-css' to 'v2.1.0' (by [`Antón Molleda`](https://github.com/molant)).
* [[`2abf2d66f8`](https://github.com/webhintio/hint/commit/2abf2d66f8ae620edab9d1dada6eb828d4531c1c)] - Chore: Update 'hint' to 'v4.5.0' (by [`Antón Molleda`](https://github.com/molant)).
* [[`1b43c65850`](https://github.com/webhintio/hint/commit/1b43c658508043d2d77422c61d4e94af21579640)] - Upgrade: Bump @types/node from 11.10.4 to 11.10.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`3438033098`](https://github.com/webhintio/hint/commit/3438033098d9f134fe05b2878ad39f50b0ddbc42)] - Upgrade: Bump mdn-browser-compat-data from 0.0.69 to 0.0.70 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`4a14448fdb`](https://github.com/webhintio/hint/commit/4a14448fdbebf96599548e49e4c8bca2fc0f05f8)] - Upgrade: Bump ava from 1.2.1 to 1.3.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`752682c3fb`](https://github.com/webhintio/hint/commit/752682c3fb691c7a159928fba1c0c85075e88ecc)] - Upgrade: Bump @types/node from 11.9.5 to 11.10.4 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`efcf80ba61`](https://github.com/webhintio/hint/commit/efcf80ba61c23c210d634c20ae85963af473606e)] - Upgrade: Bump eslint from 5.14.1 to 5.15.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`e9c11688c9`](https://github.com/webhintio/hint/commit/e9c11688c9a94d9a091e275ed847b9f5dda7ac53)] - Upgrade: Bump @typescript-eslint/parser from 1.4.0 to 1.4.2 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`9795cdfbb4`](https://github.com/webhintio/hint/commit/9795cdfbb4c8638dd4fb9d40b3e924c250705802)] - Upgrade: Bump mdn-browser-compat-data from 0.0.67 to 0.0.69 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`e6221bf245`](https://github.com/webhintio/hint/commit/e6221bf245848bbfa6008ec1e506ad4c097ec5c2)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.4.1 to 1.4.2 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`1c7509e00a`](https://github.com/webhintio/hint/commit/1c7509e00a2d55cd04e6feb162d4e99bc0c8c101)] - Upgrade: Bump @types/node from 11.9.4 to 11.9.5 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`2bd6b8d1cf`](https://github.com/webhintio/hint/commit/2bd6b8d1cffec609afccc7ab0c2ca05f06d3eaab)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.4.0 to 1.4.1 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`b08646d045`](https://github.com/webhintio/hint/commit/b08646d045f1ab3c1422958e9f1c25b607d96590)] - Upgrade: Bump markdownlint-cli from 0.13.0 to 0.14.0 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`6c5082f769`](https://github.com/webhintio/hint/commit/6c5082f769a3d280239d1699c185396a57edac0d)] - Upgrade: Bump typescript from 3.3.3 to 3.3.3333 (by [`Dependabot`](https://github.com/dependabot-bot)).


# 2.1.1 (February 21, 2019)

## Bug fixes / Improvements

* [[`c4642020cd`](https://github.com/webhintio/hint/commit/c4642020cd17923acff6dc3d6d08947bc106ec15)] - Docs: Update hint-compat-api friendly names (by [`Tony Ross`](https://github.com/antross)).
* [[`93884230f5`](https://github.com/webhintio/hint/commit/93884230f59ba2a0221f9ea364f7a0e559cbca01)] - Docs: Update links to right hints documentation (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1874`](https://github.com/webhintio/hint/issues/1874)).
* [[`44674e9c44`](https://github.com/webhintio/hint/commit/44674e9c4479cb3f3e3c2e66173437c74481f487)] - Fix: Refactor for file name convention (#1861) (by [`Karan Sapolia`](https://github.com/karansapolia) / see also: [`#1748`](https://github.com/webhintio/hint/issues/1748)).


# 2.1.0 (February 7, 2019)

## Bug fixes / Improvements

* [[`670323ad00`](https://github.com/webhintio/hint/commit/670323ad0046789d8016809ae3a80f0286a5e83b)] - Fix: Broken reference (by [`Antón Molleda`](https://github.com/molant)).
* [[`ff8fc1fbca`](https://github.com/webhintio/hint/commit/ff8fc1fbca0d37146f665797241852bcef6bc826)] - Fix: Ignore deprecated vendor prefixes when unprefixed version is present (by [`Borja Ruiz Torres`](https://github.com/borgitas21)).
* [[`aad8de5aa2`](https://github.com/webhintio/hint/commit/aad8de5aa2c00317376d767cdf6ab1218c14362d)] - Docs: Architecture documentation for Compat API Hint (by [`Borja Ruiz Torres`](https://github.com/borgitas21) / see also: [`#1749`](https://github.com/webhintio/hint/issues/1749)).
* [[`cdb84bfae1`](https://github.com/webhintio/hint/commit/cdb84bfae18f045da1eaee2a3a36adb0d5fd60e5)] - Fix: Incorrect message for prefixed subfeatures (by [`Borja Ruiz Torres`](https://github.com/borgitas21) / see also: [`#1766`](https://github.com/webhintio/hint/issues/1766)).
* [[`a42453ffda`](https://github.com/webhintio/hint/commit/a42453ffdacb54443d4a56db229b67d4b8be6833)] - Fix: Make `mdn-browser-compat-data` a dependency (by [`Tony Ross`](https://github.com/antross) / see also: [`#1752`](https://github.com/webhintio/hint/issues/1752)).

## New features

* [[`d82d567b7b`](https://github.com/webhintio/hint/commit/d82d567b7b4adb29be936a1989ae91f8a9a80948)] - New: Add `spellcheck` and `crossorigin` to default html ignore list (by [`Borja Ruiz Torres`](https://github.com/borgitas21)).
* [[`f110ed5101`](https://github.com/webhintio/hint/commit/f110ed51015174f996bd5904061b59901b55b66b)] - New: `ignore` option in `.hintrc` to exclude select features (by [`Borja Ruiz Torres`](https://github.com/borgitas21) / see also: [`#1588`](https://github.com/webhintio/hint/issues/1588)).


# 2.0.1 (January 17, 2019)

## Bug fixes / Improvements

* [[`3fc86067f3`](https://github.com/webhintio/hint/commit/3fc86067f3c65193bd9c52f614d3da3d7ef68fa8)] - Fix: Ignore duplicate reports for vendor prefixed properties (by [`Borja Ruiz Torres`](https://github.com/borgitas21) / see also: [`#1598`](https://github.com/webhintio/hint/issues/1598)).


# 2.0.0 (January 15, 2019)

## Breaking Changes

* [[`690ca34631`](https://github.com/webhintio/hint/commit/690ca3463188169da32c2f5f7959ca014117765c)] - Breaking: Rename `Interoperability` with `Compatibility` (by [`Antón Molleda`](https://github.com/molant) / see also: [`#1507`](https://github.com/webhintio/hint/issues/1507)).

## Bug fixes / Improvements

* [[`584e9569f6`](https://github.com/webhintio/hint/commit/584e9569f649ab40fbb5420460f0fb8bc2b675a2)] - Docs: Remove empty `Further reading` section and make improvements (by [`Cătălin Mariș`](https://github.com/alrra) / see also: [`#1686`](https://github.com/webhintio/hint/issues/1686)).
* [[`e844ed87e6`](https://github.com/webhintio/hint/commit/e844ed87e696cdcfbd00601a5565665d37686551)] - Fix: Handle optional `node.source` from `postcss` (by [`Tony Ross`](https://github.com/antross) / see also: [`#1661`](https://github.com/webhintio/hint/issues/1661)).

## New features

* [[`ac8e2c41e4`](https://github.com/webhintio/hint/commit/ac8e2c41e4170b163623fdd93938a79fff39d45c)] - New: HTML compatibility hints (by [`Borja Ruiz Torres`](https://github.com/borgitas21)).


# 1.0.0 (January 2, 2019)

✨
