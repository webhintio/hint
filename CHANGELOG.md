# 0.6.2 (September 8, 2017)

## Bug fixes / Improvements

* [[`bedc9644dc`](https://github.com/sonarwhal/sonar/commit/bedc9644dcd844455140da8fb2572716c8135fec)] - Fix: Make `npm` package actually include `npm-shrinkwrap.json` file (see also: [`#481`](https://github.com/sonarwhal/sonar/issues/481)).


# 0.6.1 (September 8, 2017)

## Bug fixes / Improvements

* [[`0d7b4038bf`](https://github.com/sonarwhal/sonar/commit/0d7b4038bfd07987c969253429c77d4acc997eab)] - Fix: Add `npm-shrinkwrap.json` to the `npm` package (see also: [`#481`](https://github.com/sonarwhal/sonar/issues/481)).
* [[`3300798874`](https://github.com/sonarwhal/sonar/commit/3300798874163866fa38da6a8295ad10033878a3)] - Fix: SemVer related issue with `no-vulnerable-javascript-libraries` rule (see also: [`#504`](https://github.com/sonarwhal/sonar/issues/504)).


# 0.6.0 (September 8, 2017)

## Bug fixes / Improvements

* [[`32dcb344bd`](https://github.com/sonarwhal/sonar/commit/32dcb344bd36a2e5aa94ae2e3589e0d9cb5ad72c)] - Fix: Make improvements to `chrome` connector (see also: [`#387`](https://github.com/sonarwhal/sonar/issues/387), and [`#471`](https://github.com/sonarwhal/sonar/issues/471)).
* [[`97bc6ea26b`](https://github.com/sonarwhal/sonar/commit/97bc6ea26b61b32c98499e4754a66ad48ce21511)] - Fix: Make `fetchContent` return raw data in chrome (see also: [`#495`](https://github.com/sonarwhal/sonar/issues/495)).
* [[`a5b9951d2d`](https://github.com/sonarwhal/sonar/commit/a5b9951d2d2a83d047c22f9b08252974666e1355)] - Fix: Spinner getting stuck issue (see also: [`#485`](https://github.com/sonarwhal/sonar/issues/485)).
* [[`481961c571`](https://github.com/sonarwhal/sonar/commit/481961c571059137a780aa3d5243ab4d232a016d)] - Docs: Make rule code examples more consistent.
* [[`e2af8a87cf`](https://github.com/sonarwhal/sonar/commit/e2af8a87cf2a3a1fb892006853b98a423fd7dff6)] - Fix: Infinite hop calculation when there's a cycle (see also: [`#486`](https://github.com/sonarwhal/sonar/issues/486)).

## New features

* [[`ab11a172a3`](https://github.com/sonarwhal/sonar/commit/ab11a172a3d6a0f84a316d63654df29ecd343a7c)] - Update: `snyk-snapshot.json`.
* [[`78b6cb1bb1`](https://github.com/sonarwhal/sonar/commit/78b6cb1bb1d677aadb316f24e05f56342ffacbcc)] - New: Add rule to check manifest's `name` and `short_name` members (see also: [`#136`](https://github.com/sonarwhal/sonar/issues/136)).
* [[`7c4947eac1`](https://github.com/sonarwhal/sonar/commit/7c4947eac194c1985ca666b3e504274814b0520e)] - New: Add rule to check `apple-touch-icon`s usage (see also: [`#33`](https://github.com/sonarwhal/sonar/issues/33)).
* [[`d13e26be35`](https://github.com/sonarwhal/sonar/commit/d13e26be354752ea59740cfc7604952c04d21dcd)] - New: Add `summary` fomatter (see also: [`#487`](https://github.com/sonarwhal/sonar/issues/487)).


# 0.5.2 (September 2, 2017)

## Bug fixes / Improvements

* [[`861931f83d`](https://github.com/sonarwhal/sonar/commit/861931f83d257172efb219f04cc45fbbfd414093)] - Fix: Make `html-checker` rule not break if no HTML is passed.
* [[`d3899126b8`](https://github.com/sonarwhal/sonar/commit/d3899126b87019a516654757b3ac07f3156f3e53)] - Fix: Error in `onLoadingFailed` (see also: [`#469`](https://github.com/sonarwhal/sonar/issues/469)).
* [[`4eeeda950f`](https://github.com/sonarwhal/sonar/commit/4eeeda950f20ec737f73df96e4770efb1aa585a5)] - Fix: Improve error messages for `highest-available-document-mode` rule (see also: [`#483`](https://github.com/sonarwhal/sonar/issues/483) and [`#477`](https://github.com/sonarwhal/sonar/issues/477)).
* [[`19f95d12be`](https://github.com/sonarwhal/sonar/commit/19f95d12be6a4f0c911b343efe541f1e1b321788)] - Fix: Error with `jsdom` and attribute names containing `.` (see also: [`#482`](https://github.com/sonarwhal/sonar/issues/482)).
* [[`b125186fb7`](https://github.com/sonarwhal/sonar/commit/b125186fb759d9d92b952111681f50b28b71f3f1)] - Fix: Remove `null` locations from error messages (see also: [`#478`](https://github.com/sonarwhal/sonar/issues/478)).


# 0.5.1 (September 1, 2017)

## Bug fixes / Improvements

* [[`f45b745479`](https://github.com/sonarwhal/sonar/commit/f45b745479d5b38670b6e6f3a9293abda60c3fde)] - Fix: Lock `jsdom` to `v11.1.0` in `package.json`.


# 0.5.0 (August 31, 2017)

## Breaking Changes

* [[`c2d0282591`](https://github.com/sonarwhal/sonar/commit/c2d0282591b79fab4c32ba45e939b4eb96438237)] - Breaking: Rename `cdp` connector to `chrome` (see also: [`#361`](https://github.com/sonarwhal/sonar/issues/361)).

## Bug fixes / Improvements

* [[`0cc1f05e51`](https://github.com/sonarwhal/sonar/commit/0cc1f05e515755e6f25542c6c4d0362b48e3ba4e)] - Docs: Tweak `no-vulnerable-javascript-libraries` rule related documentation (see also: [`#470`](https://github.com/sonarwhal/sonar/issues/470)).
* [[`984aabcf7c`](https://github.com/sonarwhal/sonar/commit/984aabcf7c8cdc0d5f77922ea002f75164740a44)] - Fix: Filter out duplicate fetch requests (see also: [`#460`](https://github.com/sonarwhal/sonar/issues/460)).
* [[`df53c0ef36`](https://github.com/sonarwhal/sonar/commit/df53c0ef36bb642344da1f3a7f9ec27c95e8dd78)] - Fix: Update CLI templates (see also: [`#461`](https://github.com/sonarwhal/sonar/issues/461)).
* [[`bbf1e6eaa4`](https://github.com/sonarwhal/sonar/commit/bbf1e6eaa401a14733a623a9416292966d8e64e0)] - Fix: Make `content-type` correctly detect the `charset`.

## New features

* [[`60c6c725d1`](https://github.com/sonarwhal/sonar/commit/60c6c725d138212b07cee00cc8b508f6b37a2e2d)] - Update: `snyk-snapshot.json`.
* [[`633f6d3a53`](https://github.com/sonarwhal/sonar/commit/633f6d3a53cca623fff796d0b5e8ce721bf7213c)] - New: Ask about `browserslist` when generating the configs (see also: [`#446`](https://github.com/sonarwhal/sonar/issues/446)).
* [[`0852ab95b2`](https://github.com/sonarwhal/sonar/commit/0852ab95b27cd9934df6805fe333aedbd102cff8)] - New: Add rule to check for vulnerable libraries (see also: [`#125`](https://github.com/sonarwhal/sonar/issues/125)).


# 0.4.0 (August 25, 2017)

## Breaking Changes

* [[`e35b778004`](https://github.com/sonarwhal/sonar/commit/e35b778004be3038d0b994f9a258dd454b994622)] - Breaking: Make `content-type` rule use proper fonts types (see also: [`#425`](https://github.com/sonarwhal/sonar/issues/425)).
* [[`941d439aff`](https://github.com/sonarwhal/sonar/commit/941d439affca16e3af1b0df90e739ee746df2313)] - Breaking: Upgrade `file-type` to `v6.1.0` (see also: [`#428`](https://github.com/sonarwhal/sonar/issues/428)).
* [[`c03079912b`](https://github.com/sonarwhal/sonar/commit/c03079912beda28a7d4f7b4bc9427b3cd0e8e621)] - Breaking: Use `browserslist` defaults (see also: [`#452`](https://github.com/sonarwhal/sonar/issues/452) and [`#453`](https://github.com/sonarwhal/sonar/issues/453)).

## Bug fixes / Improvements

* [[`0507ff7279`](https://github.com/sonarwhal/sonar/commit/0507ff72793989790694695ef2633d8d177218de)] - Docs: Fix link to `no-disallowed-headers` (see also: [`#403`](https://github.com/sonarwhal/sonar/issues/403)).
* [[`56fc97aa3c`](https://github.com/sonarwhal/sonar/commit/56fc97aa3c4f84f89eb5fb07a59b4c36d8e4deb8)] - Fix: Make `rule-generator` not encode quotes (see also: [`#392`](https://github.com/sonarwhal/sonar/issues/392)).
* [[`49833d62ca`](https://github.com/sonarwhal/sonar/commit/49833d62ca4e5ccd2c9ad90ad010aabf9587a1f4)] - Fix: `SyntaxError` when using `jsdom` (see also: [`#404`](https://github.com/sonarwhal/sonar/issues/404)).
* [[`45955ebc5c`](https://github.com/sonarwhal/sonar/commit/45955ebc5ce0473a421cb2bb4445721c2801c50c)] - Docs: Fix link in `strict-transport-security.md` (see also: [`#417`](https://github.com/sonarwhal/sonar/issues/417)).
* [[`dd161ed3d0`](https://github.com/sonarwhal/sonar/commit/dd161ed3d0abddb10c6bfc9d5be51ca68c916964)] - Docs: Make minor improvements (see also: [`#437`](https://github.com/sonarwhal/sonar/issues/437)).
* [[`5cc4484a83`](https://github.com/sonarwhal/sonar/commit/5cc4484a836881a6fa0ec40eee56027c143bf2f4)] - Docs: Update `Code of Conduct` links.
* [[`aa14e6cb57`](https://github.com/sonarwhal/sonar/commit/aa14e6cb573afe07345fa64f489bc17b53c5792d)] - Fix: Avoid analyzing `/favicon.ico` multiple times (see also: [`#427`](https://github.com/sonarwhal/sonar/issues/427)).
* [[`9755cadf04`](https://github.com/sonarwhal/sonar/commit/9755cadf0442203ca30d2850d4e950ac068b9503)] - Fix: Error when scanning non-existent URL (see also: [`#389`](https://github.com/sonarwhal/sonar/issues/389)).

## New features

* [[`2be5a4ba20`](https://github.com/sonarwhal/sonar/commit/2be5a4ba203aea66b6b61ac7e9c2a4c7fdf191f8)] - New: Add rule to check the usage of the `Strict-Transport-Security` header (see also: [`#23`](https://github.com/sonarwhal/sonar/issues/23)).
* [[`e9e4a95fd7`](https://github.com/sonarwhal/sonar/commit/e9e4a95fd73210d44cb62fa0769082756d136ad0)] - New: Notify users when a new version of `sonar` is available (see also: [`#419`](https://github.com/sonarwhal/sonar/issues/419)).
* [[`d515c5aa8b`](https://github.com/sonarwhal/sonar/commit/d515c5aa8bf1cba850d4f7bafaeb33588ab3a5f7)] - New: Create a new config file if one doesn't exist (see also: [`#354`](https://github.com/sonarwhal/sonar/issues/354)).
* [[`12a415f40d`](https://github.com/sonarwhal/sonar/commit/12a415f40dcdb711861b2494be31f0504cac3471)] - New: Add rule to check the usage of the `Set-Cookie` header (see also: [`#24`](https://github.com/sonarwhal/sonar/issues/24)).
* [[`f70a4d37e8`](https://github.com/sonarwhal/sonar/commit/f70a4d37e8ef24c6165b548c3d45cbfea1e9439b)] - New: Add rule to check the usage of the `viewport` meta tag (see also: [`#82`](https://github.com/sonarwhal/sonar/issues/82)).


# 0.3.0 (July 1, 2017)

## Breaking Changes

* [[`acfd196ed7`](https://github.com/sonarwhal/sonar/commit/acfd196ed708b4f40d08ea9c7063a6d60dd2f812)] - Breaking: Rename `disallowed-headers` rule.

## Bug fixes / Improvements

* [[`d55171d36e`](https://github.com/sonarwhal/sonar/commit/d55171d36e367c46b3d0ec2f791c7ec2d955bd52)] - Docs: Add missing `)` in x-content-type-options.md.
* [[`28c782db16`](https://github.com/sonarwhal/sonar/commit/28c782db16ca6140a083fae76f143a05f595694e)] - Fix: Make `disown-opener` ignore certain protocols.


# 0.2.0 (July 2, 2017)

## Breaking Changes

* [[`8b202fb8d9`](https://github.com/sonarwhal/sonar/commit/8b202fb8d930248275fe9984ba23e868be35f77c)] - Breaking: Disable `ssllabs` rule by default (see also: [`#355`](https://github.com/sonarwhal/sonar/issues/355)).
* [[`6fcb46ae17`](https://github.com/sonarwhal/sonar/commit/6fcb46ae17abc1933f8ee30b98cad59d15be9843)] - Breaking: Use `connector` instead of `collector` (see also: [`#286`](https://github.com/sonarwhal/sonar/issues/286), and [`#358`](https://github.com/sonarwhal/sonar/issues/358)).

## Bug fixes / Improvements

* [[`b9d278e7a1`](https://github.com/sonarwhal/sonar/commit/b9d278e7a189f4bb12992f0bdcbf78cd471f95c1)] - Docs: Move `CODE_OF_CONDUCT.md` in the root (see also: [`#353`](https://github.com/sonarwhal/sonar/issues/353)).
* [[`7b904d6b4f`](https://github.com/sonarwhal/sonar/commit/7b904d6b4f68bcf8b757a1aa3b04b842e5f0317b)] - Docs: Fix broken links (see also: [`#363`](https://github.com/sonarwhal/sonar/issues/363)).
* [[`ae149ba609`](https://github.com/sonarwhal/sonar/commit/ae149ba60916e593b2afc0d64252e43d527e6e64)] - Docs: Add pull request related guidelines (see also: [`#373`](https://github.com/sonarwhal/sonar/issues/373)).
* [[`d52247d3e1`](https://github.com/sonarwhal/sonar/commit/d52247d3e10686255c8596aaf494b0bb26cd954e)] - Docs: Add note about handling permission issues (see also: [`#308`](https://github.com/sonarwhal/sonar/issues/308), and [`#364`](https://github.com/sonarwhal/sonar/issues/364)).
* [[`9cd8d7fdc9`](https://github.com/sonarwhal/sonar/commit/9cd8d7fdc9baf68c59a823801de04c87f49b31d8)] - Docs: Fix broken links in `pull-requests.md`.
* [[`fd6c083f84`](https://github.com/sonarwhal/sonar/commit/fd6c083f841132189a54e3d8d3bba9ff88473e1d)] - Docs: Make minor improvements (see also: [`#367`](https://github.com/sonarwhal/sonar/issues/367)).

## New features

* [[`08f36db2b4`](https://github.com/sonarwhal/sonar/commit/08f36db2b4b9736f5c7f0522861cda8eed658926)] - New: Add rule to check markup validity (see also: [`#28`](https://github.com/sonarwhal/sonar/issues/28)).
* [[`2893a0a7c1`](https://github.com/sonarwhal/sonar/commit/2893a0a7c16abca27c1ce457d0ff05d7334b093f)] - New: Make connectors download manifest & favicon (see also: [`#71`](https://github.com/sonarwhal/sonar/issues/71)).


# 0.1.0 (June 30, 2017)

## Breaking changes

* [[`2e29881377d`](https://github.com/sonarwhal/sonar/commit/2e29881377dd36a2e8d13b006482346b18b6bc73)] -
  Change how `sonar` resources are loaded
  (see also: [`#234`](https://github.com/sonarwhal/sonar/issues/234)).

## Bug fixes / Improvements

* [[`98e3b2e5aa3`](https://github.com/sonarwhal/sonar/commit/98e3b2e5aa34445e7871f897071f7216f7fdd561)] -
  Fix `Could not find node with given id` error
  (see also: [`#275`](https://github.com/sonarwhal/sonar/issues/275)).
* [[`48ed6e9e19c`](https://github.com/sonarwhal/sonar/commit/48ed6e9e19ccf47e84f6e960cc37be1dd2b2a262)] -
  Refactor `CDP` related code
  (see also:
  [`#311`](https://github.com/sonarwhal/sonar/issues/311),
  [`#330`](https://github.com/sonarwhal/sonar/issues/330),
  [`#324`](https://github.com/sonarwhal/sonar/issues/324), and
  [`#332`](https://github.com/sonarwhal/sonar/issues/332)).
* [[`c3803821c06`](https://github.com/sonarwhal/sonar/commit/c3803821c0619b5210f5fe0fd1a37d27fb9a1143)] -
  Improve requester
  (see also: [`#260`](https://github.com/sonarwhal/sonar/issues/260)).
* [[`b613918fdde`](https://github.com/sonarwhal/sonar/commit/b613918fdde302106a3b777f70df0c9a31fcc37c)] -
  Improve documentation.

## New features

* [[`3e2863b3963`](https://github.com/sonarwhal/sonar/commit/3e2863b3963403406b178b46ade8b62824e432bd)] -
  Add support for rule shorthands, and ability to specify rules as an array
  (see also: [`#283`](https://github.com/sonarwhal/sonar/issues/283)).
* [[`b54dd55b48a`](https://github.com/sonarwhal/sonar/commit/b54dd55b48aada5e2fd63df002a2d2096e1164be)] -
  Add rule generator
  (see also: [`#238`](https://github.com/sonarwhal/sonar/issues/238)).
* [[`70018b6b33b`](https://github.com/sonarwhal/sonar/commit/70018b6b33bca821cab9de23900d47dac24b1524)] -
  Make `disown-opener` rule use `targetedBrowsers`.
