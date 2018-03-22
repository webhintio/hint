# 1.2.1 (March 22, 2018)

## Bug fixes / Improvements

* [[`f679ad4181`](https://github.com/sonarwhal/sonarwhal/commit/f679ad4181add3044faff03087f680767feeebb2)] - Fix: Infinite loop when running the `--init` command (by [`Jesus David García Gomez`](https://github.com/sarvaje) / see also: [`#908`](https://github.com/sonarwhal/sonarwhal/issues/908)).


# 1.2.0 (March 20, 2018)

## Bug fixes / Improvements

* [[`f20ca70df9`](https://github.com/sonarwhal/sonarwhal/commit/f20ca70df954bea6b12357599d25cb9c001681ff)] - Fix: Install packages as sonarwhal was installed (by [`Qing Zhou`](https://github.com/qzhou1607) / see also: [`#868`](https://github.com/sonarwhal/sonarwhal/issues/868)).
* [[`0704ed5bfd`](https://github.com/sonarwhal/sonarwhal/commit/0704ed5bfd329e9e9148cb8ef0650f9de4179808)] - Docs: Fix `aXe` link from `FAQ.md` (by [`Cătălin Mariș`](https://github.com/alrra) / see also: [`#899`](https://github.com/sonarwhal/sonarwhal/issues/899)).

## New features

* [[`7edd85baf5`](https://github.com/sonarwhal/sonarwhal/commit/7edd85baf5a9f481a4475996d9de6d5005fa06c6)] - New: Add `text/plain` media type to `getType` (by [`Cătălin Mariș`](https://github.com/alrra)).


# 1.1.0 (March 15, 2018)

## New features

* [[`1f30ec2d72`](https://github.com/sonarwhal/sonarwhal/commit/1f30ec2d72e94413d40f3ae9e121b9a2a5d9a321)] - New: Define media type for `rc` config files.


# 1.0.5 (March 14, 2018)

## Bug fixes / Improvements

* [[`6765280f4e`](https://github.com/sonarwhal/sonarwhal/commit/6765280f4e16aad2b0727471cfec1ac0c6817a3e)] - Fix: Generated `.sonarwhalrc` from `--new-rule` (see also: [`#878`](https://github.com/sonarwhal/sonarwhal/issues/878)).
* [[`ad126251d6`](https://github.com/sonarwhal/sonarwhal/commit/ad126251d6e7a4d59e45418ccb3539745e53905b)] - Fix: Remove unused options in CLI help (see also: [`#886`](https://github.com/sonarwhal/sonarwhal/issues/886)).


# 1.0.4 (March 13, 2018)

## Bug fixes / Improvements

* [[`82aa8227ba`](https://github.com/sonarwhal/sonarwhal/commit/82aa8227ba71aeb926bfc26c23f8976bdccc8ef3)] - Fix: Call `formatter.format` asynchronously (see also: [`#880`](https://github.com/sonarwhal/sonarwhal/issues/880)).


# 1.0.3 (March 12, 2018)

## Bug fixes / Improvements

* [[`283a28a075`](https://github.com/sonarwhal/sonarwhal/commit/283a28a075a0fdc26264d40deac116b3400693e7)] - Fix: Update `connector-edge` to `v1.0.0`.


# 1.0.2 (March 12, 2018)

## Bug fixes / Improvements

* [[`0fb48ef4f0`](https://github.com/sonarwhal/sonarwhal/commit/0fb48ef4f0076ea8715c777316ddfaa1b17e6e27)] - Fix: Issue with passing unknown commands (see also: [`#877`](https://github.com/sonarwhal/sonarwhal/issues/877)).
* [[`37fb863f80`](https://github.com/sonarwhal/sonarwhal/commit/37fb863f80126d920caba95feefe8b54c01d0c0f)] - Fix: Issue when no configuration file exists (see also: [`#876`](https://github.com/sonarwhal/sonarwhal/issues/876)).


# 1.0.1 (March 12, 2018)

## Bug fixes / Improvements

* [[`91b8ca1306`](https://github.com/sonarwhal/sonarwhal/commit/91b8ca1306117eee5b8fb9bc181bb3c254ac097c)] - Fix: Handle undefined `ignoredUrls` (see also: [`#873`](https://github.com/sonarwhal/sonarwhal/issues/873)).


# 1.0.0 (March 9, 2018)

## Bug fixes / Improvements

* [[`a8a158b014`](https://github.com/sonarwhal/sonarwhal/commit/a8a158b01408daff2e97ae0de783b0d0a9b833ef)] - Fix: Dependencies and scripts for `--new-parser`.
* [[`30579567c3`](https://github.com/sonarwhal/sonarwhal/commit/30579567c306e66476aea2d9f4f2f72379d5e863)] - Fix: Dependencies and scripts for `--new-rule`.
* [[`af07cd0b1f`](https://github.com/sonarwhal/sonarwhal/commit/af07cd0b1faad75bc04d6a794a66ffe89349b2fc)] - Fix: `Init` wizard when using a configuration.
* [[`366e833121`](https://github.com/sonarwhal/sonarwhal/commit/366e833121a8f59be07ad25bdc96ae3e36b2fcfd)] - Fix: Improve `init` wizard.

## New features

* [[`d0d18917e0`](https://github.com/sonarwhal/sonarwhal/commit/d0d18917e02f449b46ef3df0381f90eb658c5dbf)] - New: Search for `.sonarwhalrc` in user's `homedir` (see also: [`#718`](https://github.com/sonarwhal/sonarwhal/issues/718)).
* [[`09fb512397`](https://github.com/sonarwhal/sonarwhal/commit/09fb512397b0b0318fb72de76b6204158e06d9ee)] - New: Add optional parameter `target` to `formatters`.
* [[`e3b097b06f`](https://github.com/sonarwhal/sonarwhal/commit/e3b097b06f06a83375a1e184dc432746113fd8c2)] - New: Optional param `packageName` in `getRuleName`.


# 0.28.2 (March 7, 2018)

## Bug fixes / Improvements

* Optimize published package.


# 0.28.1 (March 6, 2018)

## Bug fixes / Improvements

* [[`7aeb1f04b4`](https://github.com/sonarwhal/sonarwhal/commit/7aeb1f04b47299e1a1180b37bb6390d5472fcbf7)] - Fix: Add path to load external packages.


# 0.28.0 (March 6, 2018)

## Breaking Changes

* [[`cb2f670722`](https://github.com/sonarwhal/sonarwhal/commit/cb2f67072276cfe624cf60bf2381eb6cb1ef5a16)] - Breaking: Use types instead of interfaces.
* [[`af5a07c8cd`](https://github.com/sonarwhal/sonarwhal/commit/af5a07c8cd825d5b41bf65444d78a83e743875b9)] - Breaking: Use classes instead of components.

## Bug fixes / Improvements

* [[`a96856b17e`](https://github.com/sonarwhal/sonarwhal/commit/a96856b17ee43dd2a49b0fd28476c1b7edd4e0f0)] - Docs: Add information about configurations.
* [[`efe26fcbc0`](https://github.com/sonarwhal/sonarwhal/commit/efe26fcbc0a78a2eabb2e96adfbc9b1166820863)] - Fix: `browserslist` generation.
* [[`29138e3c82`](https://github.com/sonarwhal/sonarwhal/commit/29138e3c82dba32468fffdea991b18e27081a67f)] - Docs: Update `architecture.md`.
* [[`ac344b587b`](https://github.com/sonarwhal/sonarwhal/commit/ac344b587b4d0592c973d6abfd9ee6bb4480d0f7)] - Fix: Add missing dependencies.
* [[`bd8c54786a`](https://github.com/sonarwhal/sonarwhal/commit/bd8c54786a2211df37254e84972222dcb86bf1ca)] - Fix: Add missing `shelljs` dependency.

## New features

* [[`5cde8da7eb`](https://github.com/sonarwhal/sonarwhal/commit/5cde8da7eb7d64079ab6c626d1dd48107730d8d0)] - New: Support configuration rules in global.


# 0.27.0 (February 23, 2018)

## Bug fixes / Improvements

* [[`2b1145e961`](https://github.com/sonarwhal/sonar/commit/2b1145e961e9ad86015ad3443d2383f42940a61c)] - Docs: Update contributor documentation (see also: [`#827`](https://github.com/sonarwhal/sonar/issues/827)).

## New features

* [[`1bd7cbadb5`](https://github.com/sonarwhal/sonar/commit/1bd7cbadb51408f4f21293828e2ea2796bc9cfc0)] - New: Make `sonarwhal` install missing packages (see also: [`#834`](https://github.com/sonarwhal/sonar/issues/834)).


# 0.26.0 (February 20, 2018)

## Breaking Changes

* [[`f4536396d3`](https://github.com/sonarwhal/sonarwhal/commit/f4536396d3177c969eee023a6598aa1ba5e0cefe)] - Breaking: Replace `worksWithLocalFiles` with `scope` (see also: [`#816`](https://github.com/sonarwhal/sonarwhal/issues/816)).
* [[`03b798b241`](https://github.com/sonarwhal/sonarwhal/commit/03b798b2411a7ec303fe04c7618afb70cbc9b08c)] - Breaking: Change how `--new-rule` works and drop `--remove-rule` (see also: [`#806`](https://github.com/sonarwhal/sonarwhal/issues/806)).

## Bug fixes / Improvements

* [[`5772885390`](https://github.com/sonarwhal/sonarwhal/commit/577288539056bc72c70300e987bfb558f44dc255)] - Docs: Fix broken links (see also: [`#823`](https://github.com/sonarwhal/sonarwhal/issues/823)).
* [[`f5679a86e2`](https://github.com/sonarwhal/sonarwhal/commit/f5679a86e2d6bf4dbbd19a1aac62fa617e400ae1)] - Fix: Wait until the browser is completely closed.
* [[`1b1712cc4e`](https://github.com/sonarwhal/sonarwhal/commit/1b1712cc4e48ed07c0433c6d6d8c9f34215d70d9)] - Update: `browserslist` to `v3.0.0` (see also: [`#809`](https://github.com/sonarwhal/sonarwhal/issues/809)).

## New features

* [[`69becf000a`](https://github.com/sonarwhal/sonarwhal/commit/69becf000a6ec4b3ce1b80426a28ef2897db1840)] - New: Search on `npm` on `resource-loader.ts`.
* [[`1f4b818016`](https://github.com/sonarwhal/sonarwhal/commit/1f4b818016aa1cccd86d4fd6019f4695e117e21a)] - New: Switch to using a monorepo architecture (see also: [`#748`](https://github.com/sonarwhal/sonarwhal/issues/748)).


# 0.25.0 (February 6, 2018)

## Bug fixes / Improvements

* [[`dac0adbc05`](https://github.com/sonarwhal/sonarwhal/commit/dac0adbc05f521ea2c70cd4d9bd77a89425227c4)] - Docs: Update image links in markdown files.
* [[`09aad7c9bc`](https://github.com/sonarwhal/sonarwhal/commit/09aad7c9bcf7e43c47331ecf39deaa31b392c568)] - Docs: Add SVG version of the architecture image (see also: [`#792`](https://github.com/sonarwhal/sonarwhal/issues/792)).
* [[`1da22fb556`](https://github.com/sonarwhal/sonarwhal/commit/1da22fb556dc6d2ad63ce8d7a500c7dda26b471a)] - Docs: Fix typo in `http-compression.md`.
* [[`129ec11cb9`](https://github.com/sonarwhal/sonarwhal/commit/129ec11cb9d3f478ef3c42c212b113b183a258ea)] - Docs: Reorganize contributor guide (see also: [`#781`](https://github.com/sonarwhal/sonarwhal/issues/781)).
* [[`e67e615fc3`](https://github.com/sonarwhal/sonarwhal/commit/e67e615fc3cc82710749cf5daa39eed8fd41f89d)] - Docs: Fix link in `meta-viewport.md`.
* [[`f3a3e811c2`](https://github.com/sonarwhal/sonarwhal/commit/f3a3e811c2d87bd7afccf3d7d96d7529a50f5b83)] - Fix: `parse::javascript` emit timing (see also: [`#780`](https://github.com/sonarwhal/sonarwhal/issues/780)).

## New features

* [[`49cf9795c4`](https://github.com/sonarwhal/sonarwhal/commit/49cf9795c42795440e7e7e03520b15d7ec0710f4)] - Update: `snyk-snapshot.json`.


# 0.24.0 (January 25, 2018)

## Breaking Changes

* [[`6a2f29b6ec`](https://github.com/sonarwhal/sonarwhal/commit/6a2f29b6ec9cce9f651cce0083cfbd934dff7997)] - Breaking: Limit `X-Content-Type-Options` usage to scripts and stylesheets (see also: [`#767`](https://github.com/sonarwhal/sonarwhal/issues/767)).

## Bug fixes / Improvements

* [[`53a5b57220`](https://github.com/sonarwhal/sonarwhal/commit/53a5b572206d6919c053a5194ff5555069b85695)] - Fix: Make `http-cache` rule ignore Data URIs (see also: [`#778`](https://github.com/sonarwhal/sonarwhal/issues/778)).
* [[`7349b9728f`](https://github.com/sonarwhal/sonarwhal/commit/7349b9728f065ec13c2b887ae22c99c36173975d)] - Docs: Fix typo in `options.ts` (see also: [`#776`](https://github.com/sonarwhal/sonarwhal/issues/776)).
* [[`b67ef431da`](https://github.com/sonarwhal/sonarwhal/commit/b67ef431da269daf93a7173e6051991e8478deec)] - Docs: Add examples of IIS server configurations (see also: [`#774`](https://github.com/sonarwhal/sonarwhal/issues/774)).
* [[`cbcd924fe0`](https://github.com/sonarwhal/sonarwhal/commit/cbcd924fe04a47e5714f412493e291e5d9d5b62f)] - Fix: Make `summary` the default formatter (see also: [`#722`](https://github.com/sonarwhal/sonarwhal/issues/722)).

## New features

* [[`1d63f99035`](https://github.com/sonarwhal/sonarwhal/commit/1d63f99035b15b7529ff94df0e750e2314914c3f)] - Update: `snyk-snapshot.json`.


# 0.23.1 (January 18, 2018)

## Bug fixes / Improvements

* [[`afc468d754`](https://github.com/sonarwhal/sonarwhal/commit/afc468d7541754ff6d5992fc106514a093ce68eb)] - Docs: Add examples on how to configure Apache in order to pass the rules (see also: [`#751`](https://github.com/sonarwhal/sonarwhal/issues/751)).


# 0.23.0 (January 17, 2018)

## Breaking Changes

* [[`2e75ac5242`](https://github.com/sonarwhal/sonarwhal/commit/2e75ac52424b55d12b70b248fa2866bb67f4341f)] - Breaking: Use `text/xml` as the media type for `XML`.

## Bug fixes / Improvements

* [[`87d2af7be5`](https://github.com/sonarwhal/sonarwhal/commit/87d2af7be54d87fc62d423323d0e789590d3d03a)] - Fix: Add new patterns for filename based revving to the `http-cache` rule (see also: [`#741`](https://github.com/sonarwhal/sonarwhal/issues/741)).
* [[`29064a3e9b`](https://github.com/sonarwhal/sonarwhal/commit/29064a3e9b99d8067367a25cb6618ab180266713)] - Docs: Fix typo in `image-optimization-cloudinary`.

## New features

* [[`188d270f03`](https://github.com/sonarwhal/sonarwhal/commit/188d270f03aeeda4a4515072e9958feb18840829)] - New: Make `no-disallowed-headers` allow by default the `Server` HTTP header (see also: [`#747`](https://github.com/sonarwhal/sonarwhal/issues/747)).


# 0.22.1 (January 12, 2018)

## Bug fixes / Improvements

* [[`0bb6f817ec`](https://github.com/sonarwhal/sonarwhal/commit/0bb6f817ec2350b4e95680dd5c09ba8cce457fe2)] - Fix: Headers not being set correctly in `Requester` (see also: [`#749`](https://github.com/sonarwhal/sonarwhal/issues/749)).


# 0.22.0 (January 9, 2018)

## Bug fixes / Improvements

* [[`ec729e1545`](https://github.com/sonarwhal/sonarwhal/commit/ec729e1545014b5a4d849b9f8b133f8bb5af2513)] - Fix: Issues in `requester` and `http-compression` (see also: [`#731`](https://github.com/sonarwhal/sonarwhal/issues/731)).
* [[`6e1a12ef42`](https://github.com/sonarwhal/sonarwhal/commit/6e1a12ef42fba1bd6007583365efacc6cbea25c4)] - Fix: Pass parsers to tests (see also: [`#740`](https://github.com/sonarwhal/sonarwhal/issues/740)).

## New features

* [[`d10583922e`](https://github.com/sonarwhal/sonarwhal/commit/d10583922e24069c979e34e80196262e1ab95ac4)] - Update: `snyk-snapshot.json`.
* [[`e44e7cc98f`](https://github.com/sonarwhal/sonarwhal/commit/e44e7cc98f423b74ccf6c05f6d3ad5a5c1666332)] - New: Add rule to check if resources are served compressed (see also: [`#12`](https://github.com/sonarwhal/sonarwhal/issues/12) and [`#1`](https://github.com/sonarwhal/sonarwhal/issues/1)).
* [[`b66af0c045`](https://github.com/sonarwhal/sonarwhal/commit/b66af0c0450dfb64db08891d00156c2a011cadba)] - New: Make test server allow alternative responses.
* [[`fdeadb9669`](https://github.com/sonarwhal/sonarwhal/commit/fdeadb96691b76f4e8418f2ea3f9d075b7db65a0)] - New: Add `element` info to `traverse` events.
* [[`a03316adc1`](https://github.com/sonarwhal/sonarwhal/commit/a03316adc193a37990b8412bffb044f2ea36c99b)] - New: Add `local` connector (see also: [`#737`](https://github.com/sonarwhal/sonarwhal/issues/737)).
* [[`a041abcff5`](https://github.com/sonarwhal/sonarwhal/commit/a041abcff5645a0d35a284ac27e5236f8578c4f9)] - New: Upgrade `axe-core` to `v2.6` (see also: [`#736`](https://github.com/sonarwhal/sonarwhal/issues/736)).


# 0.21.0 (January 4, 2018)

## Bug fixes / Improvements

* [[`c482c99844`](https://github.com/sonarwhal/sonarwhal/commit/c482c998446f63e14db17092910567f225f74c22)] - Fix: Sync connector certificate config with `requester`.
* [[`f082067fe8`](https://github.com/sonarwhal/sonarwhal/commit/f082067fe8e69cc905c4ab85e02d10d9a9a0b1a9)] - Fix: Downgrade HTTP/2 headers in `rawResponse`.
* [[`e3e1ca02d5`](https://github.com/sonarwhal/sonarwhal/commit/e3e1ca02d5db904a645184b389bb8d1186bf2227)] - Fix: Improve error message for unhandled promises.
* [[`80c15103a1`](https://github.com/sonarwhal/sonarwhal/commit/80c15103a17958201333a327083de9561185ee24)] - Docs: Fix typos in `strict-transport-security.md` (see also: [`#729`](https://github.com/sonarwhal/sonarwhal/issues/729)).
* [[`bd335c2c32`](https://github.com/sonarwhal/sonarwhal/commit/bd335c2c324721376af4fe7bb7d7690e5ca189b6)] - Docs: Add information on creating external rule (see also: [`#724`](https://github.com/sonarwhal/sonarwhal/issues/724)).
* [[`10d1881a69`](https://github.com/sonarwhal/sonarwhal/commit/10d1881a69283e32681262f250db6f830fad0cda)] - Fix: Support external rules outside `@sonarwhal` (see also: [`#713`](https://github.com/sonarwhal/sonarwhal/issues/713)).
* [[`742c9af408`](https://github.com/sonarwhal/sonarwhal/commit/742c9af4081b1c9a9a1eac128a3b79d4db17d06c)] - Docs: Fix link in `rules/http-cache.md` (see also: [`#723`](https://github.com/sonarwhal/sonarwhal/issues/723)).
* [[`035fd4c9e5`](https://github.com/sonarwhal/sonarwhal/commit/035fd4c9e58cf8d6af803c24095e470f4fc11689)] - Docs: Add missing link in `connectors.md`.

## New features

* [[`db6337b220`](https://github.com/sonarwhal/sonarwhal/commit/db6337b2206b710b70f93bf47c828ffc1ff3e41f)] - Update: `snyk-snapshot.json`.
* [[`511bba9c01`](https://github.com/sonarwhal/sonarwhal/commit/511bba9c0109b0cd6ea9348ad2d403000da2c726)] - New: Add type `Parser` and JavaScript parser (see also: [`#720`](https://github.com/sonarwhal/sonarwhal/issues/720)).


# 0.20.1 (Decembe 12, 2017)

## Bug fixes / Improvements

* [[`559380f65e`](https://github.com/sonarwhal/sonarwhal/commit/559380f65e3edfa50d15896c66b3c8be48c7431c)] - Fix: Issue where tests of external rules couldn’t be run.


# 0.20.0 (Decembe 12, 2017)

## Bug fixes / Improvements

* [[`0a9657642b`](https://github.com/sonarwhal/sonarwhal/commit/0a9657642b40321ce287bca7c0ac9e62d5f5c72b)] - Fix: Enable cache in `requester`.

## New features

* [[`69f2ece8b4`](https://github.com/sonarwhal/sonarwhal/commit/69f2ece8b40fe2eec057a3c013c0b24d31efa82d)] - New: Add `http-cache` rule (see also: [`#708`](https://github.com/sonarwhal/sonarwhal/issues/708)).


# 0.19.0 (Decembe 11, 2017)

## New features

* [[`d99100df54`](https://github.com/sonarwhal/sonarwhal/commit/d99100df542f1c34425ce631b00ed3a1f4d8da0a)] - New: Add better support for creating and running external rules (see also: [`#696`](https://github.com/sonarwhal/sonarwhal/issues/696)).


# 0.18.0 (Decembe 11, 2017)

## Breaking Changes

* [[`ff472cc53d`](https://github.com/sonarwhal/sonarwhal/commit/ff472cc53ddc76d19230f5152d1c7733f6474cc9)] - Breaking: Fix parsing of file extensions (see also: [`#698`](https://github.com/sonarwhal/sonarwhal/issues/698)).

## Bug fixes / Improvements

* [[`222152093d`](https://github.com/sonarwhal/sonarwhal/commit/222152093d158f5bf6339ab2683d4f89b7172afe)] - Docs: Fix links to concepts.
* [[`45af1045a3`](https://github.com/sonarwhal/sonarwhal/commit/45af1045a350c006da8efbbc7f1d206afd3d58d1)] - Docs: Make minor fixes and improvements.
* [[`c7d4bada7b`](https://github.com/sonarwhal/sonarwhal/commit/c7d4bada7b3b69252e72b5a44f9e11707db9d37f)] - Docs: Reorganize `User Guide` (see also: [`#697`](https://github.com/sonarwhal/sonarwhal/issues/697)).
* [[`3ef2793601`](https://github.com/sonarwhal/sonarwhal/commit/3ef27936011dde33953b8b9f08480eb9a37202c0)] - Docs: Fix rule name in `no-http-redirects.md` (see also: [`#686`](https://github.com/sonarwhal/sonarwhal/issues/686)).

## New features

* [[`72b76324d0`](https://github.com/sonarwhal/sonarwhal/commit/72b76324d02ce20715077bcded245248ba97f851)] - Update: `snyk-snapshot.json`.


# 0.17.0 (November 29, 2017)

## Bug fixes / Improvements

* [[`2a1623cbf0`](https://github.com/sonarwhal/sonarwhal/commit/2a1623cbf0dcc5cf3a8f445f43bf9a9cd0a6c13f)] - Docs: Add `edge` connector related information (see also: [`#671`](https://github.com/sonarwhal/sonarwhal/issues/671)).
* [[`61874f64d0`](https://github.com/sonarwhal/sonarwhal/commit/61874f64d0016d9dd2f2e688a1d01096d71cbbb7)] - Docs: Mention performance aspects in `meta-viewport.md`.
* [[`eec1298cd7`](https://github.com/sonarwhal/sonarwhal/commit/eec1298cd79e28a575bbc7912802b4f9d35c696e)] - Docs: Fix typo in `apple-touch-icons.md`.
* [[`58e650d4c4`](https://github.com/sonarwhal/sonarwhal/commit/58e650d4c4e083b9a00ffde49ad9b3739336ea5e)] - Docs: Make minor improvements in `meta-viewport.md`.
* [[`6ed5fb5a45`](https://github.com/sonarwhal/sonarwhal/commit/6ed5fb5a45dd99c4ea31cb26d8d31cd118cda48a)] - Docs: Rephrase `Public-Key-Pins` related information.
* [[`b333372fc3`](https://github.com/sonarwhal/sonarwhal/commit/b333372fc375e9b1058bcbbf8f47827da1f7a85b)] - Docs: Fix rule name in `user-guide/rules/index.md`.
* [[`c382d8771a`](https://github.com/sonarwhal/sonarwhal/commit/c382d8771adbac3afcab493b2c781ee6a26b7e45)] - Fix: Add missing `Category` import in the rule template.
* [[`5d7203e5b0`](https://github.com/sonarwhal/sonarwhal/commit/5d7203e5b02fc26eb1947b32d041047acf24145c)] - Docs: Fix typo in `docs/user-guide/index.md`.

## New features

* [[`6f28a78aa2`](https://github.com/sonarwhal/sonarwhal/commit/6f28a78aa2b66b1dfe22200bdfc59f22f15aaec6)] - Update: `snyk-snapshot.json`.
* [[`6892a5ea7a`](https://github.com/sonarwhal/sonarwhal/commit/6892a5ea7a36b08e9ce372ac177aefc3fbabacc7)] - New: Add `connector-edge` as an `optionalDependency` (see also: [`#671`](https://github.com/sonarwhal/sonarwhal/issues/671)).
* [[`f1ead8cddd`](https://github.com/sonarwhal/sonarwhal/commit/f1ead8cddd5e6bd4f39f7c4cbd37ac09e20e6c52)] - New: Add `defaultProfile` to Chrome launcher (see also: [`#628`](https://github.com/sonarwhal/sonarwhal/issues/628)).
* [[`4a35e62834`](https://github.com/sonarwhal/sonarwhal/commit/4a35e62834f373ea0789c37882ef2784cd7263a5)] - New: Make connectors provide the `charset` and `media type` the response (see also: [`#676`](https://github.com/sonarwhal/sonarwhal/issues/676)).


# 0.16.0 (November 14, 2017)

## Breaking Changes

* [[`015d53e4b0`](https://github.com/sonarwhal/sonarwhal/commit/015d53e4b0a1a384e4929ebdbbce5d85a9fa6af4)] - Breaking: Rename `sonar` to `sonarwhal` everywhere (see also: [`#655`](https://github.com/sonarwhal/sonarwhal/issues/655)).

## Bug fixes / Improvements

* [[`84b8eb3135`](https://github.com/sonarwhal/sonarwhal/commit/84b8eb31353f1b6aa90930d0381d255a2caae718)] - Docs: Update repository references.


# 0.15.0 (November 14, 2017)

## Breaking Changes

* [[`b71b6f472a`](https://github.com/sonarwhal/sonarwhal/commit/b71b6f472adaafda50079d5cbc769e7f05324ac0)] - Breaking: Rename project from `sonar` to `sonarwhal`.

## Bug fixes / Improvements

* [[`dd0a96ec98`](https://github.com/sonarwhal/sonarwhal/commit/dd0a96ec98ec81c7820f30180c99c1bebe932b50)] - Docs: Fix rule name in `image-optimization-cloudinary.md` (see also: [`#646`](https://github.com/sonarwhal/sonarwhal/issues/646)).

## New features

* [[`d6a1af9aa0`](https://github.com/sonarwhal/sonarwhal/commit/d6a1af9aa0bf9c8cc1cb84d27d77979c5aca1f4b)] - New: Add HPKP headers in `no-disallowed-headers` (see also: [`#631`](https://github.com/sonarwhal/sonarwhal/issues/631)).
* [[`b6626897f8`](https://github.com/sonarwhal/sonarwhal/commit/b6626897f88ebcc7f8c9682f127cb002bc03f921)] - New: Add `no-http-redirects` rule (see also: [`#641`](https://github.com/sonarwhal/sonarwhal/issues/641)).


# 0.14.2 (November 10, 2017)

## Bug fixes / Improvements

* [[`9736b13290`](https://github.com/sonarwhal/sonarwhal/commit/9736b132908fdde03bbfb5874fe754aff5fd7ee9)] - Fix: Improve third party service integration.
* [[`e587e734b2`](https://github.com/sonarwhal/sonarwhal/commit/e587e734b209e1cbb6301028520b61a5a6e0b07c)] - Fix: Use `rulesTimeout` in `evaluate` (see also: [`#630`](https://github.com/sonarwhal/sonarwhal/issues/630)).
* [[`7ad1c39e89`](https://github.com/sonarwhal/sonarwhal/commit/7ad1c39e89cdc60463adadfba2b78befe14f040a)] - Fix: Reduce `timeout` for requests (see also: [`#585`](https://github.com/sonarwhal/sonarwhal/issues/585)).
* [[`ca02a33311`](https://github.com/sonarwhal/sonarwhal/commit/ca02a33311e9dc3c17721bd0b916337b5d3617a9)] - Fix: Handle timeout in `no-vulnerable-libraries` rule (see also: [`#627`](https://github.com/sonarwhal/sonarwhal/issues/627)).
* [[`a8242fb7c3`](https://github.com/sonarwhal/sonarwhal/commit/a8242fb7c3d367093eac3b5b630580e09c935597)] - Docs: Fix typos.


# 0.14.1 (November 2, 2017)

## Bug fixes / Improvements

* [[`4d13905075`](https://github.com/sonarwhal/sonarwhal/commit/4d139050755af4bf828727c4d699c85813162fb7)] - Fix: Make `Debugging Protocol Connector` related improvements (see also: [`#621`](https://github.com/sonarwhal/sonarwhal/issues/621)).
* [[`f5650fba6f`](https://github.com/sonarwhal/sonarwhal/commit/f5650fba6f800b3e8b36ec2a325d24a3ecb5b14d)] - Fix: Force exit when `exitCode` is received (see also: [`#622`](https://github.com/sonarwhal/sonarwhal/issues/622)).
* [[`8de8005af3`](https://github.com/sonarwhal/sonarwhal/commit/8de8005af30777e68f86fed7c19ecf348c19721c)] - Fix: Make `manifest-app-name` rule not fail for invalid content (see also: [`#610`](https://github.com/sonarwhal/sonarwhal/issues/610)).
* [[`0c17774475`](https://github.com/sonarwhal/sonarwhal/commit/0c1777447521f466be4774fb997cd272b962b405)] - Docs: Update `Permission issue` section from `User Guide`.


# 0.14.0 (October 31, 2017)

## Bug fixes / Improvements

* [[`f6136dc82e`](https://github.com/sonarwhal/sonarwhal/commit/f6136dc82ec925dc45bc973e1fc80574a0054873)] - Fix: Make `jsdom` not hang for invalid certificate (see also: [`#612`](https://github.com/sonarwhal/sonarwhal/issues/612), and [`#615`](https://github.com/sonarwhal/sonarwhal/issues/615)).
* [[`c62ec505c5`](https://github.com/sonarwhal/sonarwhal/commit/c62ec505c5ea623f460c1d7b89e66aa634246f03)] - Docs: Make minor fixes in examples.
* [[`85a432e9ff`](https://github.com/sonarwhal/sonarwhal/commit/85a432e9ff7a3bd33c37de094b28b507c7a66834)] - Docs: Fix broken links.
* [[`400f5b5592`](https://github.com/sonarwhal/sonarwhal/commit/400f5b5592338b6b1f621c4fad21d47f2dadc14c)] - Docs: Rename `Developer Guide` to `Contributor Guide` (see also: [`#609`](https://github.com/sonarwhal/sonarwhal/issues/609)).
* [[`924c0e7cef`](https://github.com/sonarwhal/sonarwhal/commit/924c0e7ceff3930cbe527a353ffa4312a71909d2)] - Docs: Fix link in `no-protocol-relative-urls.md`.

## New features

* [[`a1833cd08d`](https://github.com/sonarwhal/sonarwhal/commit/a1833cd08d37f0195c93da2d85e55be48f77ab72)] - Update: `snyk-snapshot.json`.


# 0.13.0 (October 27, 2017)

## Breaking Changes

* [[`255bb7bc0c`](https://github.com/sonarwhal/sonarwhal/commit/255bb7bc0c5429475619a51926cedf709e7c0c68)] - Breaking: Change definition of `ignoredUrls`.


# 0.12.3 (October 23, 2017)

## Bug fixes / Improvements

* [[`3f03824695`](https://github.com/sonarwhal/sonarwhal/commit/3f03824695d1553dfe4d5334632a9ea28e694d9c)] - Fix: Issue with Cloudinary and error handling.
* [[`1e131ddb28`](https://github.com/sonarwhal/sonarwhal/commit/1e131ddb2828d1718b1c2c756d3cda7c38f4ba0b)] - Docs: Fix link in `docs/about/FAQ.md` (see also: [`#592`](https://github.com/sonarwhal/sonarwhal/issues/592)).


# 0.12.2 (October 20, 2017)

## Bug fixes / Improvements

* [[`4ed7cf2aa9`](https://github.com/sonarwhal/sonarwhal/commit/4ed7cf2aa9092e15576287226271dfa9b8e82979)] - Fix: Issue in Cloudinary with invalid images.


# 0.12.1 (October 20, 2017)

## Bug fixes / Improvements

* [[`0e141f33ce`](https://github.com/sonarwhal/sonarwhal/commit/0e141f33ce7d159e22c7e33aa15867e03eff025a)] - Fix: Cloudinary authentication issue.


# 0.12.0 (October 19, 2017)

## Bug fixes / Improvements

* [[`92c815ca57`](https://github.com/sonarwhal/sonarwhal/commit/92c815ca57cf791e93a36b68c602588a4f1b2cc2)] - Fix: Improve `test-server` and `debugging-protocol` requests logic (see also: [`#582`](https://github.com/sonarwhal/sonarwhal/issues/582)).

## New features

* [[`8a7e1ea5f7`](https://github.com/sonarwhal/sonarwhal/commit/8a7e1ea5f7bbe5dc21db412a79aec487354d986b)] - New: Add image optimization rule using Cloudinary's service (see also: [`#575`](https://github.com/sonarwhal/sonarwhal/issues/575)).


# 0.11.0 (October 19, 2017)

## Breaking Changes

* [[`f794bc8f36`](https://github.com/sonarwhal/sonarwhal/commit/f794bc8f362c970d0cc398546e7bf614a4759661)] - Breaking: Require `text/javascript` as the media type for JavaScript files (see also: [`#568`](https://github.com/sonarwhal/sonarwhal/issues/568)).

## Bug fixes / Improvements

* [[`55b2190c35`](https://github.com/sonarwhal/sonarwhal/commit/55b2190c354fde5ed581c4d00a9f5e235ff4ae53)] - Docs: Update FAQ with information about the online scanner and the project history (see also: [`#580`](https://github.com/sonarwhal/sonarwhal/issues/580)).


# 0.10.2 (October 5, 2017)

## Bug fixes / Improvements

* [[`8da2e2da12`](https://github.com/sonarwhal/sonarwhal/commit/8da2e2da1296098146095849d59bdf7b56eabc18)] - Fix: Redo last release in order to fix the `node\r` related issue (see also: [`#564`](https://github.com/sonarwhal/sonarwhal/issues/564)).


# 0.10.1 (October 4, 2017)

## Bug fixes / Improvements

* [[`2918e04ce7`](https://github.com/sonarwhal/sonarwhal/commit/2918e04ce7a21381cacee03ffe373a3bc276bb54)] - Fix: Generate correctly the `.sonarrc` file if not found (see also: [`#562`](https://github.com/sonarwhal/sonarwhal/issues/562)).


# 0.10.0 (October 3, 2017)

## Bug fixes / Improvements

* [[`f5c0218bdf`](https://github.com/sonarwhal/sonarwhal/commit/f5c0218bdf5ef85921f032edece6c903abda9d07)] - Fix: Update `new-core-rule` templates (see also: [`#551`](https://github.com/sonarwhal/sonarwhal/issues/551)).
* [[`f2e500d16b`](https://github.com/sonarwhal/sonarwhal/commit/f2e500d16b4ff5c690e84b67811ec7dd319a675c)] - Fix: New version notifications handling (see also: [`#507`](https://github.com/sonarwhal/sonarwhal/issues/507)).
* [[`bb17fbbc2b`](https://github.com/sonarwhal/sonarwhal/commit/bb17fbbc2b9e92fc6e5bf705da1dbf75da828971)] - Fix: Don't show help after analyzing site (see also: [`#553`](https://github.com/sonarwhal/sonarwhal/issues/553)).
* [[`f6dae7cfe2`](https://github.com/sonarwhal/sonarwhal/commit/f6dae7cfe21068b56f6e7d9b9a9156943980545c)] - Fix: Property name for new tab url.
* [[`718f7198ac`](https://github.com/sonarwhal/sonarwhal/commit/718f7198ac1bf0624fb9a13a3bc71445942c9f40)] - Fix: Make tests more reliable and faster (see also: [`#502`](https://github.com/sonarwhal/sonarwhal/issues/502)).

## New features

* [[`62a52a66a4`](https://github.com/sonarwhal/sonarwhal/commit/62a52a66a409adc106dc0f7100b4a38253a95f82)] - New: Make viewport rule work with `viewport-fit` (see also: [`#557`](https://github.com/sonarwhal/sonarwhal/issues/557)).
* [[`01fbe5ee9c`](https://github.com/sonarwhal/sonarwhal/commit/01fbe5ee9cc2d8c9e93f61ddfbfc47cd41e9faae)] - New: Add `amp-validator` rule (see also: [`#545`](https://github.com/sonarwhal/sonarwhal/issues/545)).
* [[`67553dce6c`](https://github.com/sonarwhal/sonarwhal/commit/67553dce6c0c390b561cca0d44aa0bf8a07e7515)] - New: Add option to create external rule (see also: [`#528`](https://github.com/sonarwhal/sonarwhal/issues/528)).


# 0.9.0 (September 27, 2017)

## Breaking Changes

* [[`e585daa5d5`](https://github.com/sonarwhal/sonarwhal/commit/e585daa5d51db030edc259443705d938d7ff66a6)] - Breaking: Make `rawResponse` a `Promise<Buffer>` (see also: [`#164`](https://github.com/sonarwhal/sonarwhal/issues/164)).

## Bug fixes / Improvements

* [[`0cfb1bb49c`](https://github.com/sonarwhal/sonarwhal/commit/0cfb1bb49c847eb4d5ed54691dbb88cb796694bf)] - Fix: Create new rule only in `sonar`'s root folder (see also: [`#527`](https://github.com/sonarwhal/sonarwhal/issues/527)).

## New features

* [[`67553dce6c`](https://github.com/sonarwhal/sonarwhal/commit/67553dce6c0c390b561cca0d44aa0bf8a07e7515)] - New: Add option to create external rule (see also: [`#528`](https://github.com/sonarwhal/sonarwhal/issues/528)).


# 0.8.1 (September 22, 2017)

## Bug fixes / Improvements

* [[`41a56bef2f`](https://github.com/sonarwhal/sonarwhal/commit/41a56bef2ffd21b3612e3c0b637754b95629d242)] - Fix: Add `tests/helpers` to `npm` package (see also: [`#532`](https://github.com/sonarwhal/sonarwhal/issues/532)).
* [[`8207e0fb3b`](https://github.com/sonarwhal/sonarwhal/commit/8207e0fb3b4dc7fa180e6b057babd78252d560a8)] - Docs: Add `connector` support information (see also: [`#523`](https://github.com/sonarwhal/sonarwhal/issues/523)).


# 0.8.0 (September 20, 2017)

## Bug fixes / Improvements

* [[`ff45cb6497`](https://github.com/sonarwhal/sonarwhal/commit/ff45cb649737eaad438d54934d85bea556fdf1c5)] - Fix: Improve documentation for connectors (see also: [`#500`](https://github.com/sonarwhal/sonarwhal/issues/500)).

## New features

* [[`84561d847f`](https://github.com/sonarwhal/sonarwhal/commit/84561d847f598158d571ddef6a8f5f8201592254)] - New: Add `chrome-launcher` support for Windows Subsystem for Linux (WSL) (see also: [`GoogleChrome/chrome-launcher#26`](https://github.com/GoogleChrome/chrome-launcher/issues/26)).


# 0.7.0 (September 15, 2017)

## Breaking Changes

* [[`75b936b710`](https://github.com/sonarwhal/sonarwhal/commit/75b936b710505160fda7200034e4aada13ce1688)] - Breaking: Add support for multiple formatters (see also: [`#322`](https://github.com/sonarwhal/sonarwhal/issues/322)).

## Bug fixes / Improvements

* [[`f3074a3cbb`](https://github.com/sonarwhal/sonarwhal/commit/f3074a3cbbb5f5508d87836e042037dddcee63f7)] - Fix: Make `apple-touch-icons` rule not break for invalid or corrupt images (see also: [`#515`](https://github.com/sonarwhal/sonarwhal/issues/515)).
* [[`b2e30d6d1f`](https://github.com/sonarwhal/sonarwhal/commit/b2e30d6d1fd0f0a3f00a80fd04420d662ca6747a)] - Docs: Add `--engine-strict` to install instructions (see also: [`#511`](https://github.com/sonarwhal/sonarwhal/issues/511)).


# 0.6.3 (September 11, 2017)

## Bug fixes / Improvements

* [[`fcafcc9add`](https://github.com/sonarwhal/sonarwhal/commit/fcafcc9add5baac6fc006708ebc15ed35cec6cea)] - Fix: Make `npm` package not include `devDependencies`.


# 0.6.2 (September 8, 2017)

## Bug fixes / Improvements

* [[`bedc9644dc`](https://github.com/sonarwhal/sonarwhal/commit/bedc9644dcd844455140da8fb2572716c8135fec)] - Fix: Make `npm` package actually include `npm-shrinkwrap.json` file (see also: [`#481`](https://github.com/sonarwhal/sonarwhal/issues/481)).


# 0.6.1 (September 8, 2017)

## Bug fixes / Improvements

* [[`0d7b4038bf`](https://github.com/sonarwhal/sonarwhal/commit/0d7b4038bfd07987c969253429c77d4acc997eab)] - Fix: Add `npm-shrinkwrap.json` to the `npm` package (see also: [`#481`](https://github.com/sonarwhal/sonarwhal/issues/481)).
* [[`3300798874`](https://github.com/sonarwhal/sonarwhal/commit/3300798874163866fa38da6a8295ad10033878a3)] - Fix: SemVer related issue with `no-vulnerable-javascript-libraries` rule (see also: [`#504`](https://github.com/sonarwhal/sonarwhal/issues/504)).


# 0.6.0 (September 8, 2017)

## Bug fixes / Improvements

* [[`32dcb344bd`](https://github.com/sonarwhal/sonarwhal/commit/32dcb344bd36a2e5aa94ae2e3589e0d9cb5ad72c)] - Fix: Make improvements to `chrome` connector (see also: [`#387`](https://github.com/sonarwhal/sonarwhal/issues/387), and [`#471`](https://github.com/sonarwhal/sonarwhal/issues/471)).
* [[`97bc6ea26b`](https://github.com/sonarwhal/sonarwhal/commit/97bc6ea26b61b32c98499e4754a66ad48ce21511)] - Fix: Make `fetchContent` return raw data in chrome (see also: [`#495`](https://github.com/sonarwhal/sonarwhal/issues/495)).
* [[`a5b9951d2d`](https://github.com/sonarwhal/sonarwhal/commit/a5b9951d2d2a83d047c22f9b08252974666e1355)] - Fix: Spinner getting stuck issue (see also: [`#485`](https://github.com/sonarwhal/sonarwhal/issues/485)).
* [[`481961c571`](https://github.com/sonarwhal/sonarwhal/commit/481961c571059137a780aa3d5243ab4d232a016d)] - Docs: Make rule code examples more consistent.
* [[`e2af8a87cf`](https://github.com/sonarwhal/sonarwhal/commit/e2af8a87cf2a3a1fb892006853b98a423fd7dff6)] - Fix: Infinite hop calculation when there's a cycle (see also: [`#486`](https://github.com/sonarwhal/sonarwhal/issues/486)).

## New features

* [[`ab11a172a3`](https://github.com/sonarwhal/sonarwhal/commit/ab11a172a3d6a0f84a316d63654df29ecd343a7c)] - Update: `snyk-snapshot.json`.
* [[`78b6cb1bb1`](https://github.com/sonarwhal/sonarwhal/commit/78b6cb1bb1d677aadb316f24e05f56342ffacbcc)] - New: Add rule to check manifest's `name` and `short_name` members (see also: [`#136`](https://github.com/sonarwhal/sonarwhal/issues/136)).
* [[`7c4947eac1`](https://github.com/sonarwhal/sonarwhal/commit/7c4947eac194c1985ca666b3e504274814b0520e)] - New: Add rule to check `apple-touch-icon`s usage (see also: [`#33`](https://github.com/sonarwhal/sonarwhal/issues/33)).
* [[`d13e26be35`](https://github.com/sonarwhal/sonarwhal/commit/d13e26be354752ea59740cfc7604952c04d21dcd)] - New: Add `summary` fomatter (see also: [`#487`](https://github.com/sonarwhal/sonarwhal/issues/487)).


# 0.5.2 (September 2, 2017)

## Bug fixes / Improvements

* [[`861931f83d`](https://github.com/sonarwhal/sonarwhal/commit/861931f83d257172efb219f04cc45fbbfd414093)] - Fix: Make `html-checker` rule not break if no HTML is passed.
* [[`d3899126b8`](https://github.com/sonarwhal/sonarwhal/commit/d3899126b87019a516654757b3ac07f3156f3e53)] - Fix: Error in `onLoadingFailed` (see also: [`#469`](https://github.com/sonarwhal/sonarwhal/issues/469)).
* [[`4eeeda950f`](https://github.com/sonarwhal/sonarwhal/commit/4eeeda950f20ec737f73df96e4770efb1aa585a5)] - Fix: Improve error messages for `highest-available-document-mode` rule (see also: [`#483`](https://github.com/sonarwhal/sonarwhal/issues/483) and [`#477`](https://github.com/sonarwhal/sonarwhal/issues/477)).
* [[`19f95d12be`](https://github.com/sonarwhal/sonarwhal/commit/19f95d12be6a4f0c911b343efe541f1e1b321788)] - Fix: Error with `jsdom` and attribute names containing `.` (see also: [`#482`](https://github.com/sonarwhal/sonarwhal/issues/482)).
* [[`b125186fb7`](https://github.com/sonarwhal/sonarwhal/commit/b125186fb759d9d92b952111681f50b28b71f3f1)] - Fix: Remove `null` locations from error messages (see also: [`#478`](https://github.com/sonarwhal/sonarwhal/issues/478)).


# 0.5.1 (September 1, 2017)

## Bug fixes / Improvements

* [[`f45b745479`](https://github.com/sonarwhal/sonarwhal/commit/f45b745479d5b38670b6e6f3a9293abda60c3fde)] - Fix: Lock `jsdom` to `v11.1.0` in `package.json`.


# 0.5.0 (August 31, 2017)

## Breaking Changes

* [[`c2d0282591`](https://github.com/sonarwhal/sonarwhal/commit/c2d0282591b79fab4c32ba45e939b4eb96438237)] - Breaking: Rename `cdp` connector to `chrome` (see also: [`#361`](https://github.com/sonarwhal/sonarwhal/issues/361)).

## Bug fixes / Improvements

* [[`0cc1f05e51`](https://github.com/sonarwhal/sonarwhal/commit/0cc1f05e515755e6f25542c6c4d0362b48e3ba4e)] - Docs: Tweak `no-vulnerable-javascript-libraries` rule related documentation (see also: [`#470`](https://github.com/sonarwhal/sonarwhal/issues/470)).
* [[`984aabcf7c`](https://github.com/sonarwhal/sonarwhal/commit/984aabcf7c8cdc0d5f77922ea002f75164740a44)] - Fix: Filter out duplicate fetch requests (see also: [`#460`](https://github.com/sonarwhal/sonarwhal/issues/460)).
* [[`df53c0ef36`](https://github.com/sonarwhal/sonarwhal/commit/df53c0ef36bb642344da1f3a7f9ec27c95e8dd78)] - Fix: Update CLI templates (see also: [`#461`](https://github.com/sonarwhal/sonarwhal/issues/461)).
* [[`bbf1e6eaa4`](https://github.com/sonarwhal/sonarwhal/commit/bbf1e6eaa401a14733a623a9416292966d8e64e0)] - Fix: Make `content-type` correctly detect the `charset`.

## New features

* [[`60c6c725d1`](https://github.com/sonarwhal/sonarwhal/commit/60c6c725d138212b07cee00cc8b508f6b37a2e2d)] - Update: `snyk-snapshot.json`.
* [[`633f6d3a53`](https://github.com/sonarwhal/sonarwhal/commit/633f6d3a53cca623fff796d0b5e8ce721bf7213c)] - New: Ask about `browserslist` when generating the configs (see also: [`#446`](https://github.com/sonarwhal/sonarwhal/issues/446)).
* [[`0852ab95b2`](https://github.com/sonarwhal/sonarwhal/commit/0852ab95b27cd9934df6805fe333aedbd102cff8)] - New: Add rule to check for vulnerable libraries (see also: [`#125`](https://github.com/sonarwhal/sonarwhal/issues/125)).


# 0.4.0 (August 25, 2017)

## Breaking Changes

* [[`e35b778004`](https://github.com/sonarwhal/sonarwhal/commit/e35b778004be3038d0b994f9a258dd454b994622)] - Breaking: Make `content-type` rule use proper fonts types (see also: [`#425`](https://github.com/sonarwhal/sonarwhal/issues/425)).
* [[`941d439aff`](https://github.com/sonarwhal/sonarwhal/commit/941d439affca16e3af1b0df90e739ee746df2313)] - Breaking: Upgrade `file-type` to `v6.1.0` (see also: [`#428`](https://github.com/sonarwhal/sonarwhal/issues/428)).
* [[`c03079912b`](https://github.com/sonarwhal/sonarwhal/commit/c03079912beda28a7d4f7b4bc9427b3cd0e8e621)] - Breaking: Use `browserslist` defaults (see also: [`#452`](https://github.com/sonarwhal/sonarwhal/issues/452) and [`#453`](https://github.com/sonarwhal/sonarwhal/issues/453)).

## Bug fixes / Improvements

* [[`0507ff7279`](https://github.com/sonarwhal/sonarwhal/commit/0507ff72793989790694695ef2633d8d177218de)] - Docs: Fix link to `no-disallowed-headers` (see also: [`#403`](https://github.com/sonarwhal/sonarwhal/issues/403)).
* [[`56fc97aa3c`](https://github.com/sonarwhal/sonarwhal/commit/56fc97aa3c4f84f89eb5fb07a59b4c36d8e4deb8)] - Fix: Make `rule-generator` not encode quotes (see also: [`#392`](https://github.com/sonarwhal/sonarwhal/issues/392)).
* [[`49833d62ca`](https://github.com/sonarwhal/sonarwhal/commit/49833d62ca4e5ccd2c9ad90ad010aabf9587a1f4)] - Fix: `SyntaxError` when using `jsdom` (see also: [`#404`](https://github.com/sonarwhal/sonarwhal/issues/404)).
* [[`45955ebc5c`](https://github.com/sonarwhal/sonarwhal/commit/45955ebc5ce0473a421cb2bb4445721c2801c50c)] - Docs: Fix link in `strict-transport-security.md` (see also: [`#417`](https://github.com/sonarwhal/sonarwhal/issues/417)).
* [[`dd161ed3d0`](https://github.com/sonarwhal/sonarwhal/commit/dd161ed3d0abddb10c6bfc9d5be51ca68c916964)] - Docs: Make minor improvements (see also: [`#437`](https://github.com/sonarwhal/sonarwhal/issues/437)).
* [[`5cc4484a83`](https://github.com/sonarwhal/sonarwhal/commit/5cc4484a836881a6fa0ec40eee56027c143bf2f4)] - Docs: Update `Code of Conduct` links.
* [[`aa14e6cb57`](https://github.com/sonarwhal/sonarwhal/commit/aa14e6cb573afe07345fa64f489bc17b53c5792d)] - Fix: Avoid analyzing `/favicon.ico` multiple times (see also: [`#427`](https://github.com/sonarwhal/sonarwhal/issues/427)).
* [[`9755cadf04`](https://github.com/sonarwhal/sonarwhal/commit/9755cadf0442203ca30d2850d4e950ac068b9503)] - Fix: Error when scanning non-existent URL (see also: [`#389`](https://github.com/sonarwhal/sonarwhal/issues/389)).

## New features

* [[`2be5a4ba20`](https://github.com/sonarwhal/sonarwhal/commit/2be5a4ba203aea66b6b61ac7e9c2a4c7fdf191f8)] - New: Add rule to check the usage of the `Strict-Transport-Security` header (see also: [`#23`](https://github.com/sonarwhal/sonarwhal/issues/23)).
* [[`e9e4a95fd7`](https://github.com/sonarwhal/sonarwhal/commit/e9e4a95fd73210d44cb62fa0769082756d136ad0)] - New: Notify users when a new version of `sonar` is available (see also: [`#419`](https://github.com/sonarwhal/sonarwhal/issues/419)).
* [[`d515c5aa8b`](https://github.com/sonarwhal/sonarwhal/commit/d515c5aa8bf1cba850d4f7bafaeb33588ab3a5f7)] - New: Create a new config file if one doesn't exist (see also: [`#354`](https://github.com/sonarwhal/sonarwhal/issues/354)).
* [[`12a415f40d`](https://github.com/sonarwhal/sonarwhal/commit/12a415f40dcdb711861b2494be31f0504cac3471)] - New: Add rule to check the usage of the `Set-Cookie` header (see also: [`#24`](https://github.com/sonarwhal/sonarwhal/issues/24)).
* [[`f70a4d37e8`](https://github.com/sonarwhal/sonarwhal/commit/f70a4d37e8ef24c6165b548c3d45cbfea1e9439b)] - New: Add rule to check the usage of the `viewport` meta tag (see also: [`#82`](https://github.com/sonarwhal/sonarwhal/issues/82)).


# 0.3.0 (July 1, 2017)

## Breaking Changes

* [[`acfd196ed7`](https://github.com/sonarwhal/sonarwhal/commit/acfd196ed708b4f40d08ea9c7063a6d60dd2f812)] - Breaking: Rename `disallowed-headers` rule.

## Bug fixes / Improvements

* [[`d55171d36e`](https://github.com/sonarwhal/sonarwhal/commit/d55171d36e367c46b3d0ec2f791c7ec2d955bd52)] - Docs: Add missing `)` in x-content-type-options.md.
* [[`28c782db16`](https://github.com/sonarwhal/sonarwhal/commit/28c782db16ca6140a083fae76f143a05f595694e)] - Fix: Make `disown-opener` ignore certain protocols.


# 0.2.0 (July 2, 2017)

## Breaking Changes

* [[`8b202fb8d9`](https://github.com/sonarwhal/sonarwhal/commit/8b202fb8d930248275fe9984ba23e868be35f77c)] - Breaking: Disable `ssllabs` rule by default (see also: [`#355`](https://github.com/sonarwhal/sonarwhal/issues/355)).
* [[`6fcb46ae17`](https://github.com/sonarwhal/sonarwhal/commit/6fcb46ae17abc1933f8ee30b98cad59d15be9843)] - Breaking: Use `connector` instead of `collector` (see also: [`#286`](https://github.com/sonarwhal/sonarwhal/issues/286), and [`#358`](https://github.com/sonarwhal/sonarwhal/issues/358)).

## Bug fixes / Improvements

* [[`b9d278e7a1`](https://github.com/sonarwhal/sonarwhal/commit/b9d278e7a189f4bb12992f0bdcbf78cd471f95c1)] - Docs: Move `CODE_OF_CONDUCT.md` in the root (see also: [`#353`](https://github.com/sonarwhal/sonarwhal/issues/353)).
* [[`7b904d6b4f`](https://github.com/sonarwhal/sonarwhal/commit/7b904d6b4f68bcf8b757a1aa3b04b842e5f0317b)] - Docs: Fix broken links (see also: [`#363`](https://github.com/sonarwhal/sonarwhal/issues/363)).
* [[`ae149ba609`](https://github.com/sonarwhal/sonarwhal/commit/ae149ba60916e593b2afc0d64252e43d527e6e64)] - Docs: Add pull request related guidelines (see also: [`#373`](https://github.com/sonarwhal/sonarwhal/issues/373)).
* [[`d52247d3e1`](https://github.com/sonarwhal/sonarwhal/commit/d52247d3e10686255c8596aaf494b0bb26cd954e)] - Docs: Add note about handling permission issues (see also: [`#308`](https://github.com/sonarwhal/sonarwhal/issues/308), and [`#364`](https://github.com/sonarwhal/sonarwhal/issues/364)).
* [[`9cd8d7fdc9`](https://github.com/sonarwhal/sonarwhal/commit/9cd8d7fdc9baf68c59a823801de04c87f49b31d8)] - Docs: Fix broken links in `pull-requests.md`.
* [[`fd6c083f84`](https://github.com/sonarwhal/sonarwhal/commit/fd6c083f841132189a54e3d8d3bba9ff88473e1d)] - Docs: Make minor improvements (see also: [`#367`](https://github.com/sonarwhal/sonarwhal/issues/367)).

## New features

* [[`08f36db2b4`](https://github.com/sonarwhal/sonarwhal/commit/08f36db2b4b9736f5c7f0522861cda8eed658926)] - New: Add rule to check markup validity (see also: [`#28`](https://github.com/sonarwhal/sonarwhal/issues/28)).
* [[`2893a0a7c1`](https://github.com/sonarwhal/sonarwhal/commit/2893a0a7c16abca27c1ce457d0ff05d7334b093f)] - New: Make connectors download manifest & favicon (see also: [`#71`](https://github.com/sonarwhal/sonarwhal/issues/71)).


# 0.1.0 (June 30, 2017)

## Breaking changes

* [[`2e29881377d`](https://github.com/sonarwhal/sonarwhal/commit/2e29881377dd36a2e8d13b006482346b18b6bc73)] -
  Change how `sonar` resources are loaded
  (see also: [`#234`](https://github.com/sonarwhal/sonarwhal/issues/234)).

## Bug fixes / Improvements

* [[`98e3b2e5aa3`](https://github.com/sonarwhal/sonarwhal/commit/98e3b2e5aa34445e7871f897071f7216f7fdd561)] -
  Fix `Could not find node with given id` error
  (see also: [`#275`](https://github.com/sonarwhal/sonarwhal/issues/275)).
* [[`48ed6e9e19c`](https://github.com/sonarwhal/sonarwhal/commit/48ed6e9e19ccf47e84f6e960cc37be1dd2b2a262)] -
  Refactor `CDP` related code
  (see also:
  [`#311`](https://github.com/sonarwhal/sonarwhal/issues/311),
  [`#330`](https://github.com/sonarwhal/sonarwhal/issues/330),
  [`#324`](https://github.com/sonarwhal/sonarwhal/issues/324), and
  [`#332`](https://github.com/sonarwhal/sonarwhal/issues/332)).
* [[`c3803821c06`](https://github.com/sonarwhal/sonarwhal/commit/c3803821c0619b5210f5fe0fd1a37d27fb9a1143)] -
  Improve requester
  (see also: [`#260`](https://github.com/sonarwhal/sonarwhal/issues/260)).
* [[`b613918fdde`](https://github.com/sonarwhal/sonarwhal/commit/b613918fdde302106a3b777f70df0c9a31fcc37c)] -
  Improve documentation.

## New features

* [[`3e2863b3963`](https://github.com/sonarwhal/sonarwhal/commit/3e2863b3963403406b178b46ade8b62824e432bd)] -
  Add support for rule shorthands, and ability to specify rules as an array
  (see also: [`#283`](https://github.com/sonarwhal/sonarwhal/issues/283)).
* [[`b54dd55b48a`](https://github.com/sonarwhal/sonarwhal/commit/b54dd55b48aada5e2fd63df002a2d2096e1164be)] -
  Add rule generator
  (see also: [`#238`](https://github.com/sonarwhal/sonarwhal/issues/238)).
* [[`70018b6b33b`](https://github.com/sonarwhal/sonarwhal/commit/70018b6b33bca821cab9de23900d47dac24b1524)] -
  Make `disown-opener` rule use `targetedBrowsers`.
