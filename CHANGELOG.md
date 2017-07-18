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
