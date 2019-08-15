# 2.0.4 (August 15, 2019)


# 2.0.3 (August 6, 2019)

## Bug fixes / Improvements

* [[`909aa2f839`](https://github.com/webhintio/hint/commit/909aa2f839fe6f994f77d6601ef13f13819c2143)] - Fix: Error getting favicon with puppeteer in node 8 with headless (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2775`](https://github.com/webhintio/hint/issues/2775)).
* [[`98b25bafbb`](https://github.com/webhintio/hint/commit/98b25bafbb51dd9a83d88ebcbe951352a70a3f31)] - Docs: Add documentation for `puppeteerOptions` (by [`Tony Ross`](https://github.com/antross) / see also: [`#2772`](https://github.com/webhintio/hint/issues/2772)).

## Chores

* [[`93322e50e3`](https://github.com/webhintio/hint/commit/93322e50e3b5ac067934bf952f980531b3687233)] - Upgrade: Bump @types/node from 12.6.8 to 12.6.9 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 2.0.2 (July 30, 2019)

## Chores

* [[`201e80b1bb`](https://github.com/webhintio/hint/commit/201e80b1bb0e9086ab477bf9e901d279ab3b89c9)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.12.0 to 1.13.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`6a80bb3bc6`](https://github.com/webhintio/hint/commit/6a80bb3bc6b517d7463a3884757aacbaf00d53af)] - Upgrade: Bump eslint-plugin-import from 2.18.0 to 2.18.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`6ab12501a5`](https://github.com/webhintio/hint/commit/6ab12501a5e7fbae156150b4d742b4f755d3a51f)] - Upgrade: Bump puppeteer-core from 1.18.1 to 1.19.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`809d784591`](https://github.com/webhintio/hint/commit/809d784591cb5bee32916408749aba6c03282da6)] - Upgrade: Bump @types/node from 12.6.4 to 12.6.8 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).


# 2.0.1 (July 24, 2019)


# 2.0.0 (July 23, 2019)

## Breaking Changes

* [[`086a4a7aff`](https://github.com/webhintio/hint/commit/086a4a7aff82cd72d6d18d5c004657e908127faf)] - Breaking: Replace `chrome` connector with `puppeteer` (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2255`](https://github.com/webhintio/hint/issues/2255)).

## Bug fixes / Improvements

* [[`9124f1e0cb`](https://github.com/webhintio/hint/commit/9124f1e0cb1d54152163978cb95ae73a82b4d639)] - Fix: Correctly support `<base>`   in all connectors (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#2465`](https://github.com/webhintio/hint/issues/2465)).
* [[`ef43e03e02`](https://github.com/webhintio/hint/commit/ef43e03e026a4ffed40e82fd118d6e80bf8c0ccc)] - Docs: Improve options section (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2252`](https://github.com/webhintio/hint/issues/2252)).

## New features

* [[`c5d6d892e3`](https://github.com/webhintio/hint/commit/c5d6d892e3585b88ab2674dd604cb4166692d34a)] - New: Allow to set default timeout to `page` (by [`Antón Molleda`](https://github.com/molant)).
* [[`a872018808`](https://github.com/webhintio/hint/commit/a8720188082c752407232c6912d4fdf4b0e96d4f)] - New: Add site authentication via `options` (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2474`](https://github.com/webhintio/hint/issues/2474)).

## Chores

* [[`26a226d4ac`](https://github.com/webhintio/hint/commit/26a226d4acee71dcea4b04764911e0dda0cc41e2)] - Upgrade: Bump @types/node from 12.0.7 to 12.6.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`622dcbb407`](https://github.com/webhintio/hint/commit/622dcbb40758c9f9033680056d0201fde71a8ee6)] - Upgrade: Bump @typescript-eslint/parser from 1.10.2 to 1.12.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`bf02855454`](https://github.com/webhintio/hint/commit/bf028554540cb0edf9a671744069b20270fbb9e6)] - Upgrade: Bump @types/lodash from 4.14.134 to 4.14.136 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`bf33fb1365`](https://github.com/webhintio/hint/commit/bf33fb1365c5c4ead9e0ec9ce658129c09d1f92d)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.11.0 to 1.12.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`4b54156479`](https://github.com/webhintio/hint/commit/4b54156479d8bcb415945544d4561a0162e2694e)] - Upgrade: [Security] Bump lodash from 4.17.11 to 4.17.13 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview) / see also: [`#2676`](https://github.com/webhintio/hint/issues/2676)).
* [[`355fdfbcdc`](https://github.com/webhintio/hint/commit/355fdfbcdc4634c4985e765a060f23574c77658a)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.10.2 to 1.11.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`5e34e8971c`](https://github.com/webhintio/hint/commit/5e34e8971cd7aa04728b6ca9abac98273ccdb47b)] - Upgrade: Bump puppeteer-core from 1.17.0 to 1.18.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`85fcfa5908`](https://github.com/webhintio/hint/commit/85fcfa59082c645f59ebca3992c3e973ebd9a9e4)] - Upgrade: Bump @types/sinon from 7.0.12 to 7.0.13 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`fa8e060ffd`](https://github.com/webhintio/hint/commit/fa8e060ffda4011de97ab9bc72a8b055f6e7ca3e)] - Upgrade: Bump @types/node from 12.0.4 to 12.0.7 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`d0b50953a5`](https://github.com/webhintio/hint/commit/d0b50953a58d06b71c5a86a24ba1f58b8451e9c7)] - Upgrade: Bump @typescript-eslint/parser from 1.9.0 to 1.10.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`b63d28819e`](https://github.com/webhintio/hint/commit/b63d28819ec1292454df9c302bf3f754caece802)] - Upgrade: Bump @types/lodash from 4.14.133 to 4.14.134 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`a1068ac463`](https://github.com/webhintio/hint/commit/a1068ac463ef63bc38b6c9294d63cb84a3969a25)] - Upgrade: Bump @typescript-eslint/eslint-plugin from 1.9.0 to 1.10.2 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`f1c0a5862f`](https://github.com/webhintio/hint/commit/f1c0a5862fade1ead4f7264d9ecbadb469fa8bb4)] - Upgrade: Bump @types/is-ci from 1.1.0 to 2.0.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`43730f7122`](https://github.com/webhintio/hint/commit/43730f7122b5f0e345fe2cf7f49c530e1ffdee87)] - Upgrade: Bump @types/node from 12.0.3 to 12.0.4 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`a03a08acc9`](https://github.com/webhintio/hint/commit/a03a08acc93f0b8c73573ec79ca253bf414aa825)] - Chore: Enable tests on Windows CI (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2467`](https://github.com/webhintio/hint/issues/2467)).
* [[`f23b2f307b`](https://github.com/webhintio/hint/commit/f23b2f307bd2b942d48eaa5af0312ecebfcb9f6c)] - Upgrade: Bump @types/lodash from 4.14.132 to 4.14.133 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`67a656aa93`](https://github.com/webhintio/hint/commit/67a656aa936d4b37f2c50b5eb9aa0494778bf542)] - Upgrade: Bump typescript from 3.4.5 to 3.5.1 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview) / see also: [`#2529`](https://github.com/webhintio/hint/issues/2529)).
* [[`97c82af5a9`](https://github.com/webhintio/hint/commit/97c82af5a9702c1990abd5f221f4c5f0366b2a1c)] - Upgrade: Bump @types/node from 12.0.2 to 12.0.3 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`5c54aa319f`](https://github.com/webhintio/hint/commit/5c54aa319f18a74e96e3e869516afd23e1c4059d)] - Upgrade: Bump puppeteer-core from 1.16.0 to 1.17.0 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`fc6cd186fc`](https://github.com/webhintio/hint/commit/fc6cd186fce15ea262e919eb876245872b3153d5)] - Upgrade: Bump @types/sinon from 7.0.11 to 7.0.12 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`557a8554de`](https://github.com/webhintio/hint/commit/557a8554de588527f8a75695c0946b86589c713e)] - Upgrade: Bump eslint-plugin-import from 2.17.2 to 2.17.3 (by [`dependabot-preview[bot]`](https://github.com/apps/dependabot-preview)).
* [[`fc1c1f83e5`](https://github.com/webhintio/hint/commit/fc1c1f83e5ac393d216adafb328829de1933aef4)] - Upgrade: Bump @types/lodash from 4.14.130 to 4.14.132 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`12b2bef547`](https://github.com/webhintio/hint/commit/12b2bef54726c700863655715cebbbcdd1038ad9)] - Chore: Update dependencies and package version (by [`Tony Ross`](https://github.com/antross)).
* [[`07349d6eb3`](https://github.com/webhintio/hint/commit/07349d6eb3fc2bdcd201adb1bbb011145fc4f9bc)] - Chore: Fix favicon test (by [`Antón Molleda`](https://github.com/molant)).
* [[`0fc3f4b93e`](https://github.com/webhintio/hint/commit/0fc3f4b93e55bd2acce46b4557cbf575f0eb2108)] - Upgrade: Bump @types/lodash from 4.14.129 to 4.14.130 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`313cce5742`](https://github.com/webhintio/hint/commit/313cce5742c8d6ff855aafe563c72b8e9b7bfb5f)] - Chore: Repurpose `test-release` script (by [`Antón Molleda`](https://github.com/molant)).


# 1.0.0 (May 23, 2019)

## Breaking Changes

* [[`086a4a7aff`](https://github.com/webhintio/hint/commit/086a4a7aff82cd72d6d18d5c004657e908127faf)] - Breaking: Replace `chrome` connector with `puppeteer` (by [`Antón Molleda`](https://github.com/molant) / see also: [`#2255`](https://github.com/webhintio/hint/issues/2255)).

## Chores

* [[`07349d6eb3`](https://github.com/webhintio/hint/commit/07349d6eb3fc2bdcd201adb1bbb011145fc4f9bc)] - Chore: Fix favicon test (by [`Antón Molleda`](https://github.com/molant)).
* [[`0fc3f4b93e`](https://github.com/webhintio/hint/commit/0fc3f4b93e55bd2acce46b4557cbf575f0eb2108)] - Upgrade: Bump @types/lodash from 4.14.129 to 4.14.130 (by [`Dependabot`](https://github.com/dependabot-bot)).
* [[`313cce5742`](https://github.com/webhintio/hint/commit/313cce5742c8d6ff855aafe563c72b8e9b7bfb5f)] - Chore: Repurpose `test-release` script (by [`Antón Molleda`](https://github.com/molant)).


