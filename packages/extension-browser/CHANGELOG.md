# 2.0.1 (December 3, 2019)


# 2.0.0 (December 2, 2019)

## Breaking Changes

* [[`9266b187e3`](https://github.com/webhintio/hint/commit/9266b187e3302600ad46729006f99dce0f6af67d)] - Breaking: Update configurations to use defaults.
* [[`8ed008ffe9`](https://github.com/webhintio/hint/commit/8ed008ffe926edba18390bc12e909ac77799b2c8)] - Breaking: Remove `chromium-finder` from `@hint/utils`.

## New features

* [[`fb663cc76d`](https://github.com/webhintio/hint/commit/fb663cc76d2ee7648ff4eefc2de4c10d89e7dfd1)] - New: Update browser extension to support new severity values (see also: [`#3181`](https://github.com/webhintio/hint/issues/3181), and [`#3340`](https://github.com/webhintio/hint/issues/3340)).

## Bug fixes / Improvements

* [[`905ef61419`](https://github.com/webhintio/hint/commit/905ef614196f286dacd79f97720c97897195b8ae)] - Fix: Severity icon color.
* [[`927967b1ae`](https://github.com/webhintio/hint/commit/927967b1aed5cd7b5b77985ee22fd956df19b0aa)] - Fix: Information position in minimum hint severity section (see also: [`#3375`](https://github.com/webhintio/hint/issues/3375)).
* [[`9806266ad6`](https://github.com/webhintio/hint/commit/9806266ad68ddc26eebd2ef2a44922dcb3dbb19e)] - Fix: Syntax highlighting color incorrect for Edge (see also: [`#3270`](https://github.com/webhintio/hint/issues/3270)).
* [[`7ee688a1b1`](https://github.com/webhintio/hint/commit/7ee688a1b1178e631bb0adf0e7fdb82b576cb36b)] - Fix: Use flattened utils.

## Chores

* [[`ff322d374c`](https://github.com/webhintio/hint/commit/ff322d374c352f415dca23ac63790c9349fe30da)] - Upgrade: Bump @types/node from 12.12.7 to 12.12.12.
* [[`65fd31c70e`](https://github.com/webhintio/hint/commit/65fd31c70e3776ec0d1596cc7a1045616c6ae733)] - Upgrade: Bump react from 16.10.2 to 16.12.0.
* [[`afa82f7eed`](https://github.com/webhintio/hint/commit/afa82f7eedf15354f74260981710511be8a6faf0)] - Chore: Increase error color contrast (see also: [`#3365`](https://github.com/webhintio/hint/issues/3365)).
* [[`f044c9b5a1`](https://github.com/webhintio/hint/commit/f044c9b5a1ef400ab50a6065cea7a8c9758db8bc)] - Chore: Update references to old methods/types in hint.
* [[`2c60ff85bd`](https://github.com/webhintio/hint/commit/2c60ff85bd9f8e5f8f6b17c4bb05cb61b9d219ea)] - Chore: Change unreleased packages version to 0.0.1.
* [[`5ef883ef1d`](https://github.com/webhintio/hint/commit/5ef883ef1d9f6eb8fc1e229c211182d441cb4a98)] - Upgrade: Bump eslint from 6.5.1 to 6.6.0.
* [[`9142edc7d3`](https://github.com/webhintio/hint/commit/9142edc7d362bfa44c3f5acab05ef44e52184143)] - Upgrade: Bump eslint-plugin-markdown from 1.0.0 to 1.0.1.
* [[`e6e47c71ca`](https://github.com/webhintio/hint/commit/e6e47c71ca029bb01ffba6b8560365b995d6616d)] - Upgrade: Bump webpack from 4.39.3 to 4.41.2.
* [[`d64ecd6130`](https://github.com/webhintio/hint/commit/d64ecd6130a854ac7963ec4327346d8b000f0553)] - Upgrade: Bump @types/react from 16.9.9 to 16.9.11.
* [[`4cfa0be336`](https://github.com/webhintio/hint/commit/4cfa0be336d54a72f11afe26f602f0cbd5131245)] - Upgrade: Bump react-dom from 16.11.0 to 16.12.0.
* [[`f37743ef48`](https://github.com/webhintio/hint/commit/f37743ef48cc9da0ba7b264f649a85c4168fc4eb)] - Upgrade: Bump web-ext from 3.2.0 to 3.2.1.
* [[`e9172328e7`](https://github.com/webhintio/hint/commit/e9172328e7494e6bba58f361ec83c24c37123840)] - Chore: Drop `engine` field in `package.json`.
* [[`2dfc8d6afd`](https://github.com/webhintio/hint/commit/2dfc8d6afde8ae66caa54953bb2fb154c7414224)] - Chore: Used shared instrumentation key in the browser.
* [[`c2f74dc1a3`](https://github.com/webhintio/hint/commit/c2f74dc1a3683ce54af1f70b053f56e3fde4b9f0)] - Chore: Migrate to shared telemetry utilities.
* [[`b6182f427f`](https://github.com/webhintio/hint/commit/b6182f427ff3efafb2cb74ad013754585d709d6b)] - Upgrade: Bump glob from 7.1.5 to 7.1.6.
* [[`8b1803a77d`](https://github.com/webhintio/hint/commit/8b1803a77debd7010807ba17c21a2419ef455b69)] - Upgrade: Bump webpack-cli from 3.3.9 to 3.3.10.
* [[`1fc5d690bf`](https://github.com/webhintio/hint/commit/1fc5d690bf73ae69558eb15436e9fb337260a118)] - Upgrade: Bump eslint-plugin-react-hooks from 2.1.2 to 2.2.0.
* [[`33f81543d8`](https://github.com/webhintio/hint/commit/33f81543d828ed1ee3eedbd7d4a12804a8ffe8a5)] - Upgrade: Bump jsdom from 15.2.0 to 15.2.1.
* [[`ef9300f80b`](https://github.com/webhintio/hint/commit/ef9300f80be59dd6f428cfd0bf83decfdaec6652)] - Upgrade: Bump terser-webpack-plugin from 2.1.2 to 2.2.1.
* [[`1ee0419dbb`](https://github.com/webhintio/hint/commit/1ee0419dbbdad8928115757df7a0235ebcc70c98)] - Upgrade: Bump puppeteer-core from 1.20.0 to 2.0.0.
* [[`be6b5025a8`](https://github.com/webhintio/hint/commit/be6b5025a83ac2501baa9b33a5535c8056bd428b)] - Chore: Simplify path to utils.
* [[`5ed37ce719`](https://github.com/webhintio/hint/commit/5ed37ce719dfed3c78619f1717450a04b25644d4)] - Chore: Update packages to use @hint/utils-fs.
* [[`baa55a4ebd`](https://github.com/webhintio/hint/commit/baa55a4ebd47e21eabffef9f7be74672125aef9b)] - Chore: Update packages to use @hint/utils-network.
* [[`d95dc4a371`](https://github.com/webhintio/hint/commit/d95dc4a3711aa1a2cda74a7f83d14a49a4c92d65)] - Chore: Update packages to use @hint/utils-dom.
* [[`97bb31d0fa`](https://github.com/webhintio/hint/commit/97bb31d0fafb53572220cd647bb493716587ca2b)] - Chore: Update references to the new @hint/utils-types.
* [[`1f4b600a43`](https://github.com/webhintio/hint/commit/1f4b600a431da4f7d5d6f40aa1696a2e91cc22e0)] - Chore: Update packages to use @hint/utils-i18n.
* [[`f4973d08e3`](https://github.com/webhintio/hint/commit/f4973d08e36c53f522379048e02f0ea4efd9eea3)] - Upgrade: Bump react-dom from 16.10.2 to 16.11.0.
* [[`7c67bddcf5`](https://github.com/webhintio/hint/commit/7c67bddcf500527c58be6876cecc0831827f49b1)] - Upgrade: Bump glob from 7.1.4 to 7.1.5.
* [[`c3b2de3f1a`](https://github.com/webhintio/hint/commit/c3b2de3f1a41b3468d9fbece68371830080b09d6)] - Upgrade: Bump browserslist from 4.7.0 to 4.7.2.


# 1.2.1 (October 30, 2019)


# 1.2.0 (October 29, 2019)

## New features

* [[`214ad66898`](https://github.com/webhintio/hint/commit/214ad668983747424311cc7fb33e145c30ad1994)] - New: Enhance `can-evaluate::script` event (by [`Antón Molleda`](https://github.com/molant)).

## Chores

* [[`5bb9b3eec7`](https://github.com/webhintio/hint/commit/5bb9b3eec7b17ba61c54db9da38c741eda934ab5)] - Chore: Bump max size for browser extension (by [`Antón Molleda`](https://github.com/molant)).
* [[`a2dd8fa936`](https://github.com/webhintio/hint/commit/a2dd8fa93635434b750073ee99d5d594b278cd9a)] - Upgrade: Bump axe-core from 3.3.2 to 3.4.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`860904de59`](https://github.com/webhintio/hint/commit/860904de5944beeba2ed3c516bba6760559390d3)] - Chore: Use `IServer` instead of `Server` (by [`Antón Molleda`](https://github.com/molant)).
* [[`6fdc164013`](https://github.com/webhintio/hint/commit/6fdc164013359ecf012fb9dcd5c0ef9ed5aca192)] - Upgrade: Bump @types/sinon from 7.0.13 to 7.5.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`e8aa1098e5`](https://github.com/webhintio/hint/commit/e8aa1098e5483fea8de59b220675248fbe41b9e1)] - Chore: Omit JSX packages when bundling for the browser (by [`Tony Ross`](https://github.com/antross)).
* [[`ce965513ae`](https://github.com/webhintio/hint/commit/ce965513ae2b715881d4f7891e795c046579f0d5)] - Upgrade: Bump ava from 1.4.1 to 2.4.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview) / see also: [`#3022`](https://github.com/webhintio/hint/issues/3022)).
* [[`1d9e43dd45`](https://github.com/webhintio/hint/commit/1d9e43dd453f7971cb801cfd4f73100621dcb375)] - Chore: Fix test case to simulate parsing HTML (by [`Tony Ross`](https://github.com/antross)).
* [[`b8ba2e17cd`](https://github.com/webhintio/hint/commit/b8ba2e17cdca7fccfd274b2ba250a96329b23fe8)] - Upgrade: Bump sinon from 7.4.2 to 7.5.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`84741292b0`](https://github.com/webhintio/hint/commit/84741292b0a04f1b3bb5922bccd7c3494b86f09d)] - Upgrade: Bump @types/react-dom from 16.9.1 to 16.9.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`0d0466efff`](https://github.com/webhintio/hint/commit/0d0466efff7915f2ff929e0e85223841178eaac0)] - Upgrade: Bump typescript from 3.6.3 to 3.6.4 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`94e004be77`](https://github.com/webhintio/hint/commit/94e004be7773e4bf5b9381ab9147bc9423b89ee8)] - Upgrade: Bump jsdom from 15.1.1 to 15.2.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`5c6f1dee6e`](https://github.com/webhintio/hint/commit/5c6f1dee6e35095caf958e296c7a349696e06efa)] - Upgrade: Bump @types/react from 16.9.5 to 16.9.9 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`ac9f76a98d`](https://github.com/webhintio/hint/commit/ac9f76a98d3007b6717b8dd9e2aad641383fa5a5)] - Upgrade: Bump @types/chrome from 0.0.89 to 0.0.91 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`1d9e33db15`](https://github.com/webhintio/hint/commit/1d9e33db15f12b571273479c00b344af972c7f25)] - Chore: Allow build-release to work if build hasn't been run yet (by [`Tony Ross`](https://github.com/antross) / see also: [`#3129`](https://github.com/webhintio/hint/issues/3129)).
* [[`0cfa8ecfbf`](https://github.com/webhintio/hint/commit/0cfa8ecfbf23aa46fb3e88794531144ab262ca21)] - Chore: Update proxyquire and fix tests (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#3121`](https://github.com/webhintio/hint/issues/3121)).


# 1.1.1 (October 17, 2019)


# 1.1.0 (October 16, 2019)

## Bug fixes / Improvements

* [[`298fe8d97a`](https://github.com/webhintio/hint/commit/298fe8d97a8eb90f1b7901f3bc22d754ff2bdd7b)] - Docs: Improve information for contributors (by [`Antón Molleda`](https://github.com/molant) / see also: [`#3095`](https://github.com/webhintio/hint/issues/3095)).

## New features

* [[`ac861cf976`](https://github.com/webhintio/hint/commit/ac861cf976579a5c76e9742c5aa7ca60c72a6d5f)] - New: Report active days in a rolling 28-day period (by [`Tony Ross`](https://github.com/antross) / see also: [`#3056`](https://github.com/webhintio/hint/issues/3056)).

## Chores

* [[`99630d03dc`](https://github.com/webhintio/hint/commit/99630d03dc99cdb71a5010095a22b6908b6cdea5)] - Chore: Fix dependencies (by [`Antón Molleda`](https://github.com/molant)).
* [[`1c071e5aa9`](https://github.com/webhintio/hint/commit/1c071e5aa9e0187cf48bde513db545c2fbe3f126)] - Upgrade: Bump execa from 2.0.4 to 2.1.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`105ced1808`](https://github.com/webhintio/hint/commit/105ced18087727fe9621889738a6ef69a3a61b0e)] - Upgrade: Bump @types/react-dom from 16.9.0 to 16.9.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`9197cbad9b`](https://github.com/webhintio/hint/commit/9197cbad9b09b1c306de0eacf762dd91dbf0016b)] - Upgrade: Bump web-ext from 3.1.1 to 3.2.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`5bc90adc4a`](https://github.com/webhintio/hint/commit/5bc90adc4a31309bbad505378463b10d6a4756e7)] - Upgrade: Bump eslint-plugin-react-hooks from 2.0.1 to 2.1.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`995c967b64`](https://github.com/webhintio/hint/commit/995c967b64afbeecb5a4e4adf40179a416b4ee93)] - Upgrade: Bump eslint from 5.16.0 to 6.5.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview) / see also: [`#3092`](https://github.com/webhintio/hint/issues/3092)).
* [[`4ce811f885`](https://github.com/webhintio/hint/commit/4ce811f885f2e44e71d4f95d0ab6973b50b8537b)] - Chore: Shadow styles as CSS variables in extension (by [`Akash Hamirwasia`](https://github.com/blenderskool) / see also: [`#2590`](https://github.com/webhintio/hint/issues/2590)).
* [[`56470ea85a`](https://github.com/webhintio/hint/commit/56470ea85a52d2f255c5f2c6d1b44b7fe0410a1a)] - Upgrade: Bump @types/chrome from 0.0.88 to 0.0.89 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`6dfffeeb08`](https://github.com/webhintio/hint/commit/6dfffeeb08c8a0864fcfab8683376b346555814f)] - Upgrade: Bump @types/react from 16.8.23 to 16.9.5 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`1622a1295f`](https://github.com/webhintio/hint/commit/1622a1295f0526622dd182bcf77b0e995e016928)] - Upgrade: Bump react from 16.9.0 to 16.10.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`571a09ab89`](https://github.com/webhintio/hint/commit/571a09ab89b14ba0d721bc17d8cb0f521513156d)] - Upgrade: Bump react-dom from 16.10.1 to 16.10.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`e4e942de73`](https://github.com/webhintio/hint/commit/e4e942de7353018170a2c8ea2133c282b31acfd9)] - Upgrade: Bump terser-webpack-plugin from 1.4.1 to 2.1.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`22a5fece9b`](https://github.com/webhintio/hint/commit/22a5fece9bc64c1030e8b031cb7a2f3af2a292ca)] - Upgrade: Bump typed-css-modules from 0.6.0 to 0.6.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`8db1221f30`](https://github.com/webhintio/hint/commit/8db1221f30c3713ecff02033f5e9501de637746f)] - Upgrade: Bump react-dom from 16.9.0 to 16.10.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 1.0.3 (September 27, 2019)

## Bug fixes / Improvements

* [[`8857d73e6c`](https://github.com/webhintio/hint/commit/8857d73e6cfa0a2a826f5e2be6f0cff4dc75bc41)] - Fix: Add missing browser action (by [`Antón Molleda`](https://github.com/molant) / see also: [`#3041`](https://github.com/webhintio/hint/issues/3041)).


# 1.0.2 (September 26, 2019)


# 1.0.1 (September 24, 2019)

## Bug fixes / Improvements

* [[`e03a664f41`](https://github.com/webhintio/hint/commit/e03a664f41bfcca774ef514bb1d99b5a41f2cd7d)] - Fix: Work around CSP restrictions in Firefox (by [`Tony Ross`](https://github.com/antross) / see also: [`#3014`](https://github.com/webhintio/hint/issues/3014)).

## Chores

* [[`53edf270f8`](https://github.com/webhintio/hint/commit/53edf270f84ead765bb981345d5321568ac69142)] - Upgrade: Bump @types/node from 12.7.4 to 12.7.5 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`150a37d902`](https://github.com/webhintio/hint/commit/150a37d902fcb37ccbfea50861336bfd1bbb9b70)] - Upgrade: Bump puppeteer-core from 1.19.0 to 1.20.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`7f9dd770ec`](https://github.com/webhintio/hint/commit/7f9dd770ec0350d7f50137d322159a07a3b203da)] - Upgrade: Bump webpack-cli from 3.3.7 to 3.3.9 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 1.0.0 (September 19, 2019)

## Breaking Changes

* [[`697adb3ec1`](https://github.com/webhintio/hint/commit/697adb3ec10e6cbf3700c622569f1014be74b820)] - Breaking: Prepare for v1 (by [`Tony Ross`](https://github.com/antross)).

## Bug fixes / Improvements

* [[`373ec1d101`](https://github.com/webhintio/hint/commit/373ec1d101c68697375e6c1479cc432a8087ce5a)] - Fix: Show failure count in sidebar summary (by [`Tony Ross`](https://github.com/antross) / see also: [`#3001`](https://github.com/webhintio/hint/issues/3001)).
* [[`401496c53d`](https://github.com/webhintio/hint/commit/401496c53d598a01b7ae931255038cf204332164)] - Fix: Avoid layout jump when links get keyboard focus (by [`Tony Ross`](https://github.com/antross)).

## New features

* [[`90aa913615`](https://github.com/webhintio/hint/commit/90aa913615f3a3f3b4bb6ec8877a28742935bc0f)] - New: Group hint reports with the same message text (by [`Tony Ross`](https://github.com/antross) / see also: [`#2970`](https://github.com/webhintio/hint/issues/2970)).

## Chores

* [[`c5e66947d4`](https://github.com/webhintio/hint/commit/c5e66947d494771b487c5d45a477069c61c9ed0b)] - Upgrade: Bump typescript from 3.6.2 to 3.6.3 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`e6a35633f3`](https://github.com/webhintio/hint/commit/e6a35633f32e6d5924f404283e8bdb5740e3f602)] - Upgrade: Bump svg-url-loader from 3.0.0 to 3.0.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 0.1.0 (September 12, 2019)

## Bug fixes / Improvements

* [[`a06ecefdfd`](https://github.com/webhintio/hint/commit/a06ecefdfd004b6477ca9f4c7867fa44f5c52616)] - Fix: Ignore resources from other extensions (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2916`](https://github.com/webhintio/hint/issues/2916)).
* [[`2f652c400c`](https://github.com/webhintio/hint/commit/2f652c400c24de367bffea1e9b750a63917e1184)] - Fix: Fail fast for CSP errors in Firefox (by [`Tony Ross`](https://github.com/antross) / see also: [`#2708`](https://github.com/webhintio/hint/issues/2708)).
* [[`c6e16569aa`](https://github.com/webhintio/hint/commit/c6e16569aa3a68fca64149112d972f300c768ee6)] - Fix: Copy version to manifest bundled with webpack (by [`Tony Ross`](https://github.com/antross) / see also: [`#2964`](https://github.com/webhintio/hint/issues/2964)).
* [[`d728353147`](https://github.com/webhintio/hint/commit/d7283531470de5932e0c152b86351410b5d5c72c)] - Fix: Missing data in "manual" fetches (by [`Antón Molleda`](https://github.com/molant)).
* [[`274e4d4030`](https://github.com/webhintio/hint/commit/274e4d40308076040262ce9851b155a203f1dfd6)] - Fix: Ignore requests from Service Workers (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2928`](https://github.com/webhintio/hint/issues/2928)).
* [[`5603617df9`](https://github.com/webhintio/hint/commit/5603617df96def7c2571c8e94d595b76ec4633ec)] - Fix: Reference correct package directory in monorepo (by [`Tony Ross`](https://github.com/antross) / see also: [`#2873`](https://github.com/webhintio/hint/issues/2873)).

## New features

* [[`85dbb7a980`](https://github.com/webhintio/hint/commit/85dbb7a980bbe9893f143152d3ddd087777f8899)] - New: Prompt user to opt in to telemetry in browser extension (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2818`](https://github.com/webhintio/hint/issues/2818)).

## Chores

* [[`7d2cb353a2`](https://github.com/webhintio/hint/commit/7d2cb353a22d2469f7c01a6ba3005c6ed61405da)] - Chore: Update dependencies and package version (by [`Antón Molleda`](https://github.com/molant)).
* [[`412ad354f0`](https://github.com/webhintio/hint/commit/412ad354f0ad348db9b0fc04fc2a514cc2e195b1)] - Upgrade: Bump @types/chrome from 0.0.86 to 0.0.88 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`0d569b797d`](https://github.com/webhintio/hint/commit/0d569b797dc91be5606dc76a7214c2ff2ffcbba7)] - Upgrade: Bump axe-core from 3.3.1 to 3.3.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`83039130c4`](https://github.com/webhintio/hint/commit/83039130c445b550a3cf51eb6876028ed111a76b)] - Upgrade: Bump @types/semver from 6.0.1 to 6.0.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`6a52ef4fb5`](https://github.com/webhintio/hint/commit/6a52ef4fb50931921be5da4c4cacd8760a3de887)] - Upgrade: Bump rimraf from 2.6.3 to 3.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`c2b32de999`](https://github.com/webhintio/hint/commit/c2b32de9997a922a4744991306a9bf9b22e3910f)] - Upgrade: Bump @types/node from 12.7.3 to 12.7.4 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`a2d1f0fce1`](https://github.com/webhintio/hint/commit/a2d1f0fce1e1689fe75c22e7d3a8f1aa7b8339f9)] - Upgrade: Bump browserslist from 4.6.6 to 4.7.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`4b80454f39`](https://github.com/webhintio/hint/commit/4b80454f39b2b12cc4d1cafe7766453f4ad66227)] - Upgrade: Bump webpack from 4.39.1 to 4.39.3 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`314092bb47`](https://github.com/webhintio/hint/commit/314092bb471d9a84f6aaa6308d2aea6a442fd477)] - Chore: Defer version bumps to release script (by [`Tony Ross`](https://github.com/antross)).
* [[`8d5e1927fe`](https://github.com/webhintio/hint/commit/8d5e1927fed14c2f7629912a5715b272664ea727)] - Chore: Move browser extension docs to own package (by [`Tony Ross`](https://github.com/antross) / see also: [`#2874`](https://github.com/webhintio/hint/issues/2874)).
* [[`bbe99e3292`](https://github.com/webhintio/hint/commit/bbe99e329240a17e5f60c6c6261b0b9c2bd1774a)] - Upgrade: Bump typescript from 3.5.3 to 3.6.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`c94b993bab`](https://github.com/webhintio/hint/commit/c94b993babb99a9b49cc795fbf80663c4750ba93)] - Upgrade: Bump @types/node from 12.7.1 to 12.7.3 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`aab7643c70`](https://github.com/webhintio/hint/commit/aab7643c70042a5e7d2da9684844277d707854fe)] - Upgrade: Bump sinon from 7.3.2 to 7.4.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`49d3263dc5`](https://github.com/webhintio/hint/commit/49d3263dc51494c5bb4567cbb0ece34d05ffc344)] - Upgrade: Bump @types/react-dom from 16.8.5 to 16.9.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`6f3c6122b5`](https://github.com/webhintio/hint/commit/6f3c6122b55e2c5bf2d726f205219530d9f893ff)] - Upgrade: Bump react-dom from 16.8.6 to 16.9.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`d23d441c17`](https://github.com/webhintio/hint/commit/d23d441c1784e8f178759959b8108b633a400fd2)] - Upgrade: Bump style-loader from 0.23.1 to 1.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`67e4de0f42`](https://github.com/webhintio/hint/commit/67e4de0f426aa522376f8e37f5e343b82456eaaf)] - Chore: Update dependencies and package version (by [`Tony Ross`](https://github.com/antross)).


