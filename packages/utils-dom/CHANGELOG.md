# 2.1.2 (July 27, 2020)

## Bug fixes / Improvements

* [[`50d3ec4b25`](https://github.com/webhintio/hint/commit/50d3ec4b25a437bf5358275049f84ffb557195cc)] - Fix: Handle DocumentFragment under <template> (see also: [`#3781`](https://github.com/webhintio/hint/issues/3781)).

## Chores

* [[`4ab6e3eb10`](https://github.com/webhintio/hint/commit/4ab6e3eb10df91da311745cbd165153de057d68a)] - Chore: Improve utils-dom perf with matches() refactor (see also: [`#3904`](https://github.com/webhintio/hint/issues/3904)).
* [[`9d953777c0`](https://github.com/webhintio/hint/commit/9d953777c0e75bb0919d1b1a6f0508e00c50c688)] - Chore: Prefer querySelector over querySelectorAll (see also: [`#3862`](https://github.com/webhintio/hint/issues/3862)).
* [[`c83a91b7ae`](https://github.com/webhintio/hint/commit/c83a91b7ae3fd0cb83da15517bbcfa3c3a33ba26)] - Chore: Improve `querySelector` perf by using `cssSelect.selectOne` (see also: [`#3861`](https://github.com/webhintio/hint/issues/3861)).
* [[`4d003a6164`](https://github.com/webhintio/hint/commit/4d003a61641c23d1e78092afbe80c61b480fb6f5)] - Upgrade: Bump ava from 3.8.2 to 3.10.1.
* [[`ad8f112571`](https://github.com/webhintio/hint/commit/ad8f11257139c6e87af490f7bd99f4519bac5cf3)] - Chore: Prefer querySelector over querySelectorAll where possible in utils-dom.
* [[`1a4b1971e7`](https://github.com/webhintio/hint/commit/1a4b1971e76ce8044d4a67fd00232fe93da91ed2)] - Upgrade: Bump nyc from 15.0.1 to 15.1.0.


# 2.1.1 (May 18, 2020)

## Chores

* [[`be9cbdcf16`](https://github.com/webhintio/hint/commit/be9cbdcf160e27f49130e6e0e876f330ff89f38e)] - Upgrade: Bump @types/parse5 from 5.0.2 to 5.0.3 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`ea08bf5acc`](https://github.com/webhintio/hint/commit/ea08bf5acc5c18f221b06ef34e6dee7813d04a70)] - Upgrade: Bump ava from 3.5.2 to 3.8.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`40e3da305b`](https://github.com/webhintio/hint/commit/40e3da305b1767cb60195ab7e0a960ced84b0592)] - Upgrade: Bump parse5 from 5.1.1 to 6.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`57f790b134`](https://github.com/webhintio/hint/commit/57f790b134181b8df8fdf5d332c71b0917288731)] - Upgrade: Bump parse5-htmlparser2-tree-adapter from 5.1.1 to 6.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`a65fdf46c4`](https://github.com/webhintio/hint/commit/a65fdf46c4e9edb0c714ff0dad94e6da2f98d43b)] - Upgrade: Bump nyc from 15.0.0 to 15.0.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`df2c969c85`](https://github.com/webhintio/hint/commit/df2c969c852896b71dddd798da1f8763256e5194)] - Upgrade: Bump jsdom from 16.2.0 to 16.2.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 2.1.0 (April 15, 2020)

## New features

* [[`6b59eae3a5`](https://github.com/webhintio/hint/commit/6b59eae3a52953ccf9bb5b360dba949665d652c2)] - New: Add support for Element.matches() (by [`Tony Ross`](https://github.com/antross)).

## Chores

* [[`319819486e`](https://github.com/webhintio/hint/commit/319819486e8904aa4cf98d632062f7c470b7c9df)] - Upgrade: Bump axe-core from 3.4.1 to 3.5.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`986279d560`](https://github.com/webhintio/hint/commit/986279d560adb6c905918d0d264401bc155bd7b2)] - Upgrade: Bump ava from 3.4.0 to 3.5.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 2.0.0 (March 18, 2020)

## Breaking Changes

* [[`a99a74be62`](https://github.com/webhintio/hint/commit/a99a74be62bc64e13538940697dbe5a786f7af22)] - Breaking: Update APIs to support axe-core (by [`Tony Ross`](https://github.com/antross) / see also: [`#3593`](https://github.com/webhintio/hint/issues/3593)).

## Bug fixes / Improvements

* [[`e5f01a09c3`](https://github.com/webhintio/hint/commit/e5f01a09c3af7bb684d7773a73bbb7c8edf30241)] - Fix: Handle globals which cannot be overriden (by [`Tony Ross`](https://github.com/antross) / see also: [`#3617`](https://github.com/webhintio/hint/issues/3617)).

## Chores

* [[`57379d447a`](https://github.com/webhintio/hint/commit/57379d447a925a7a7497d469c54e116658d82294)] - Upgrade: Bump nyc from 14.1.1 to 15.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`b073a311fa`](https://github.com/webhintio/hint/commit/b073a311facfc6864efec73886645bf8e9e3f1bd)] - Upgrade: Bump typescript from 3.7.5 to 3.8.3 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`817c399c49`](https://github.com/webhintio/hint/commit/817c399c493652b08d7b8a28ea874c86d971ffb3)] - Upgrade: Bump jsdom from 16.0.1 to 16.2.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`9a7f1074d4`](https://github.com/webhintio/hint/commit/9a7f1074d421a918f5d6528815c69dfb912d3e35)] - Upgrade: Bump ava from 2.4.0 to 3.4.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`f847f60365`](https://github.com/webhintio/hint/commit/f847f6036569681f60d58fcc9214fe61f6ce2968)] - Upgrade: Bump eslint-plugin-markdown from 1.0.1 to 1.0.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`3830fbb908`](https://github.com/webhintio/hint/commit/3830fbb908c152887347417f56f70c3210ecbf26)] - Upgrade: Bump rimraf from 3.0.0 to 3.0.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`21bb432d24`](https://github.com/webhintio/hint/commit/21bb432d240341ab1013df3059b426ea70aef4fd)] - Upgrade: Bump typescript from 3.7.4 to 3.7.5 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`73d1fa9c6a`](https://github.com/webhintio/hint/commit/73d1fa9c6a83af17dda6151e4bd9fd252649cd81)] - Upgrade: Bump jsdom from 15.2.1 to 16.0.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`730a26fea9`](https://github.com/webhintio/hint/commit/730a26fea96022a877fe26065d8ce9965eefcb35)] - Upgrade: Bump eventemitter2 from 5.0.1 to 6.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`2e92bfc6d6`](https://github.com/webhintio/hint/commit/2e92bfc6d68d8161b8e85cc2e45a4654a7d182e1)] - Upgrade: Bump typescript from 3.7.3 to 3.7.4 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`2d25855042`](https://github.com/webhintio/hint/commit/2d258550426d9db7fb1446ef6f2931630feae292)] - Upgrade: Bump eslint from 6.6.0 to 6.8.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`a620f1cafb`](https://github.com/webhintio/hint/commit/a620f1cafb55af6ca7672e66989ae1c21f03dbac)] - Chore: Refactor ESLint commands (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2187`](https://github.com/webhintio/hint/issues/2187)).
* [[`a41befd3cb`](https://github.com/webhintio/hint/commit/a41befd3cb2577d2489d8d9ab1301f4b61b65bf1)] - Upgrade: Bump css-select from 2.0.2 to 2.1.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview) / see also: [`#3399`](https://github.com/webhintio/hint/issues/3399)).
* [[`046efb21e5`](https://github.com/webhintio/hint/commit/046efb21e5e3b96dc5bb3f250e9384a70b6b32c3)] - Upgrade: Bump typescript from 3.6.4 to 3.7.3 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview) / see also: [`#3421`](https://github.com/webhintio/hint/issues/3421)).


# 1.0.0 (December 2, 2019)

## Chores

* [[`afa4b28daa`](https://github.com/webhintio/hint/commit/afa4b28daaac0ec3bfcbcd0c4fcbf7d2609c081c)] - Upgrade: Bump parse5-htmlparser2-tree-adapter from 5.1.0 to 5.1.1.


