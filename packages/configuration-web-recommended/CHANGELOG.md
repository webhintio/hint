# 3.1.0 (March 22, 2018)

## New features

* [[`27347f8efd`](https://github.com/sonarwhal/sonarwhal/commit/27347f8efde08e9a366fbc38c65cb285551a3f0d)] - New: Add `rule-no-bom` (by [`Antón Molleda`](https://github.com/molant) / see also: [`#371`](https://github.com/sonarwhal/sonarwhal/issues/371)).


# 3.0.0 (March 22, 2018)

## Breaking Changes

* [[`b00267fb75`](https://github.com/sonarwhal/sonarwhal/commit/b00267fb75b63372b34c6006132dc56d56588b73)] - Breaking: Update `rule-http-compression` to `v4.0.0` (by [`Cătălin Mariș`](https://github.com/alrra)).

## Bug fixes / Improvements

* [[`36329fc161`](https://github.com/sonarwhal/sonarwhal/commit/36329fc161d90e8cf1b593d6fcde7262f3ceabae)] - Docs: Make it more clear how to integrate the rule configurations into the `.sonarwhalrc` file (by [`Cătălin Mariș`](https://github.com/alrra) / see also: [`#904`](https://github.com/sonarwhal/sonarwhal/issues/904)).


# 2.0.1 (March 13, 2018)

## New features

* [[`3a070f3598`](https://github.com/sonarwhal/sonarwhal/commit/3a070f3598d3d727e5531d3ace2f93d001c571f8)] - New: Add `rule-sri`.


# 2.0.0 (March 9, 2018)

## Breaking Changes

* [[`f82141f501`](https://github.com/sonarwhal/sonarwhal/commit/f82141f5013bab2c471e4777791915fc7e280d08)] - Breaking: Update `rule-axe` to `v3.0.0`.
* [[`2b8b251878`](https://github.com/sonarwhal/sonarwhal/commit/2b8b2518784ad7d6abb187488114664d8c2073f1)] - Breaking: Update `rule-x-content-type-options` to `v3.0.0`.
* [[`66c03f201d`](https://github.com/sonarwhal/sonarwhal/commit/66c03f201d303f072b8604b7821425cbe5ada736)] - Breaking: Update `rule-validate-set-cookie-header` to `v3.0.0`.
* [[`494b6dfb2c`](https://github.com/sonarwhal/sonarwhal/commit/494b6dfb2c0b5ec4999931562165ae6c72e317da)] - Breaking: Update `rule-strict-transport-security` to `v3.0.0`.
* [[`17f206b12a`](https://github.com/sonarwhal/sonarwhal/commit/17f206b12a257e85a069d2de60301fbcf29df7f5)] - Breaking: Update `rule-ssllabs` to `v3.0.0`.
* [[`1bb816c999`](https://github.com/sonarwhal/sonarwhal/commit/1bb816c999b0274e77536b0d0318bd5b516a4d5c)] - Breaking: Update `rule-no-vulnerable-javascript-libraries` to `v3.0.0`.
* [[`49d02f2ded`](https://github.com/sonarwhal/sonarwhal/commit/49d02f2deda3bde8a2e659de3de21113bec114f3)] - Breaking: Update `rule-no-protocol-relative-urls` to `v3.0.0`.
* [[`e6b95eba84`](https://github.com/sonarwhal/sonarwhal/commit/e6b95eba8454b46a0a34e455dcb15fe2d8c052b0)] - Breaking: Update `rule-no-http-redirects` to `v3.0.0`.
* [[`ea9759c515`](https://github.com/sonarwhal/sonarwhal/commit/ea9759c515c4ef4869699c12459db89de07a088a)] - Breaking: Update `rule-no-html-only-headers` to `v3.0.0`.
* [[`497027704d`](https://github.com/sonarwhal/sonarwhal/commit/497027704d01ac078d60c3b8640aaccb7c0e69b2)] - Breaking: Update `rule-no-friendly-error-pages` to `v3.0.0`.
* [[`ac85dc4c1e`](https://github.com/sonarwhal/sonarwhal/commit/ac85dc4c1ebed794df1406903da81a5f1ff81c24)] - Breaking: Update `rule-no-disallowed-headers` to `v3.0.0`.
* [[`a20705574a`](https://github.com/sonarwhal/sonarwhal/commit/a20705574a13fa7c2c0d1a18b92a88597fd7c8e3)] - Breaking: Update `rule-meta-viewport` to `v3.0.0`.
* [[`69d6435031`](https://github.com/sonarwhal/sonarwhal/commit/69d6435031166a4921fbfd2ae5808b4d8e4a7dea)] - Breaking: Update `rule-meta-charset-utf-8` to `v3.0.0`.
* [[`1d45bce8ee`](https://github.com/sonarwhal/sonarwhal/commit/1d45bce8ee21a9810142257c1c13f61330850494)] - Breaking: Update `rule-manifest-is-valid` to `v3.0.0`.
* [[`a8d094e747`](https://github.com/sonarwhal/sonarwhal/commit/a8d094e7470054cd12df15b7fc79002a300cdf34)] - Breaking: Update `rule-manifest-file-extension` to `v3.0.0`.
* [[`053986d516`](https://github.com/sonarwhal/sonarwhal/commit/053986d5166d55fae1d15f2d7cebf9bb82cfa40b)] - Breaking: Update `rule-manifest-exists` to `v3.0.0`.
* [[`8cde65d55b`](https://github.com/sonarwhal/sonarwhal/commit/8cde65d55b5143485d4915cd3ee70db0bdef8366)] - Breaking: Update `rule-manifest-app-name` to `v3.0.0`.
* [[`2ea625e447`](https://github.com/sonarwhal/sonarwhal/commit/2ea625e44799c466f95f004ed0dc9b2957d7a2dc)] - Breaking: Update `rule-image-optimization-cloudinary` to `v3.0.0`.
* [[`d1a58a100a`](https://github.com/sonarwhal/sonarwhal/commit/d1a58a100a282910c6b4a7b1f3641dd05ffc0a58)] - Breaking: Update `rule-http-compression` to `v3.0.0`.
* [[`6b89bd534b`](https://github.com/sonarwhal/sonarwhal/commit/6b89bd534bb2c2c45b49dbf4368ecb2595a7c0e3)] - Breaking: Update `rule-http-cache` to `v3.0.0`.
* [[`da65ab88ca`](https://github.com/sonarwhal/sonarwhal/commit/da65ab88ca0eb7c0e989f0deb7ab2e6f9c107c6b)] - Breaking: Update `rule-html-checker` to `v3.0.0`.
* [[`9a8aaf81a5`](https://github.com/sonarwhal/sonarwhal/commit/9a8aaf81a582fea9fc420100754503a5e1860953)] - Breaking: Update `rule-highest-available-document-mode` to `v3.0.0`.
* [[`fc2924af58`](https://github.com/sonarwhal/sonarwhal/commit/fc2924af58bb9a64a26a46ccbbda64a66a032474)] - Breaking: Update `rule-disown-opener` to `v3.0.0`.
* [[`9f192f0448`](https://github.com/sonarwhal/sonarwhal/commit/9f192f04483970f85d1834d127f7e503d4ed0513)] - Breaking: Update `rule-content-type` to `v3.0.0`.
* [[`512b63cb9c`](https://github.com/sonarwhal/sonarwhal/commit/512b63cb9c5269bbc2bc89d2508ee86c1569bfc8)] - Breaking: Update `rule-apple-touch-icons` to `v3.0.0`.
* [[`4f964e5eee`](https://github.com/sonarwhal/sonarwhal/commit/4f964e5eeef3ea465f9181e87a59106381124b5a)] - Breaking: Update `formatter-summary` to `v2.0.0`.
* [[`db8917759c`](https://github.com/sonarwhal/sonarwhal/commit/db8917759c20a37cf4af3310d0b05a822bbe58bf)] - Breaking: Update `formatter-stylish` to `v2.0.0`.
* [[`17222b78c9`](https://github.com/sonarwhal/sonarwhal/commit/17222b78c957e6fe8831f34aabf7d811c40e7982)] - Breaking: Update `formatter-codeframe` to `v2.0.0`.
* [[`886e482374`](https://github.com/sonarwhal/sonarwhal/commit/886e482374239974b06c1dad932a7d3324e9de9a)] - Breaking: Update `sonarwhal` to `v1.0.0`.


# 1.0.0 (March 7, 2018)

✨
