/**
 * @fileoverview `typescript-config/target` warns against providing a `compilerOptions.target`
 * in the TypeScript configuration file (i.e `tsconfig.json`) not optimized for the defined
 * `browserslist` values.
 */
import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';

import { TypeScriptConfigParse, TypeScriptConfig } from '@hint/parser-typescript-config/dist/src/types';

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class TypeScriptConfigTarget implements IHint {
    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.development,
            description: '`typescript-config/target` warns against providing a `compilerOptions.target` in the TypeScript configuration file (i.e `tsconfig.json`) not optimized for the defined `browserslist` values.'
        },
        id: 'typescript-config/target',
        schema: [],
        scope: HintScope.local
    }

    public constructor(context: HintContext) {
        const Targets: Map<string, string> = new Map([
            ['es3', 'es3'],
            ['es5', 'es5'],
            ['es6', 'es2015'],
            ['es2015', 'es2015'],
            ['es2016', 'es2016'],
            ['es2017', 'es2017'],
            ['esnext', 'esnext']
        ]);

        /**
         * ES compatibility matrix. For each version of ES, it enumerates the minimum browser with
         * acceptable support.
         *
         * Data obtained from:
         * * http://kangax.github.io/compat-table/es5/
         * * http://kangax.github.io/compat-table/es6/
         * * http://kangax.github.io/compat-table/es2016plus/
         * * http://2ality.com/2011/02/es5-shim-use-ecmascript-5-in-older.html
         * * https://www.chromestatus.com/features#ES6
         */
        const compatMatrix = {
            es5: {
                chrome: 5,
                edge: 12,
                firefox: 4,
                ie: 9,
                ie_mob: 9, // eslint-disable-line camelcase
                opera: 44,
                safari: 5
            },
            es2015: { // eslint-disable-line sort-keys
                chrome: 49,
                edge: 13,
                firefox: 37,
                ie: 'none',
                ie_mob: 'none', // eslint-disable-line camelcase
                opera: 44,
                safari: 10
            },
            es2016: {
                chrome: 57,
                edge: 14,
                firefox: 52,
                ie: 'none',
                ie_mob: 'none', // eslint-disable-line camelcase
                opera: 44,
                safari: 10.1
            },
            es2017: {
                chrome: 58,
                edge: 16,
                firefox: 53,
                ie: 'none',
                ie_mob: 'none', // eslint-disable-line camelcase
                opera: 45,
                safari: 10.1
            }
        };

        const getMajor = (version: string | number): number => {
            if (typeof version === 'number') {
                return version;
            }

            // Something like "4.4.3-4.4.4" --> 4
            return parseInt(version.split('-')[0].split('.')[0]);
        };

        /**
         * Checks if `version1` is older (i.e.: lower version) than `version2` taking into
         * account ranges and minor versions. E.g.: `4.4.3-4.4.4` will use `4.4.3` to compare
         */
        const isOlder = (version1: number | string, version2: number | string): boolean => {

            if (typeof version1 === 'number' && typeof version2 === 'number') {
                return version1 < version2;
            }

            // Can't store `typeof` or otherwise TypeScript complains about `includes` not being on `number`
            if (typeof version1 === 'string' && typeof version2 === 'string') {
                if (version1.includes('-') || version2.includes('-')) {
                    const range1 = version1.split('-')[0];
                    const range2 = version2.split('-')[0];

                    if (range1.includes('.') && range2.includes('.')) {
                        const parts1 = range1.split('.');
                        const parts2 = range2.split('.');

                        let older = true;

                        for (let i = 0; i < parts1.length && older; i++) {
                            older = isOlder(parseInt(parts1[i]), parseInt(parts2[i]));
                        }

                        return older;

                    }

                    return isOlder(parseInt(range1), parseInt(range2));
                }
            }

            // If we reach this point we are probably comparing something like "android 62" and "android 4.4.3-4.4.4"
            return isOlder(getMajor(version1), getMajor(version2));
        };

        /** Transforms a browserslist array into an object with the minimum versions of each one */
        const toMiniumBrowser = (targetedBrowsers: Array<string>) => {
            const configuration = targetedBrowsers.reduce((config, browserVersion) => {
                // The format in the array is "browser version". E.g.: "firefox 52"
                const [browser, strVersion] = browserVersion.split(' ');
                const version = strVersion.includes('.') || strVersion.includes('-') ? strVersion : parseInt(strVersion);
                const previousVersion = config[browser];


                if (!previousVersion || isOlder(version, previousVersion)) {
                    config[browser] = version;
                }

                return config;
            }, {});

            return configuration;
        };

        /**
         * Based on the minimum supported browser configuration passed,
         * determines what's the maximum ES version that can be targetted.
         */
        const getMaxVersion = (minimumBrowsers): string => {
            const versions = Object.keys(compatMatrix);
            let maxVersion = 'es3';

            /**
             * This will check all the ES versions and compare all the
             * browsers from the compat matrix agains the given ones.
             * If there's one in the compat matrix newer than the ones
             * provided, it will fail.
             */
            versions.forEach((version) => {
                /** The list of browsers to take into account for the compat matrix. */
                const browsers: [string, string | number][] = Object.entries(compatMatrix[version]);

                const validates = browsers.reduce((valid, [browser, minimumBrowserVersion]) => {
                    const minimumTargettedBrowserVersion = minimumBrowsers[browser];

                    // The user doesn't care about this browser, there isn't a version
                    if (!minimumTargettedBrowserVersion) {
                        return valid;
                    }

                    /*
                     * The user cares about this browsers but there's no browsers version that supports
                     * this ES release.
                     * E.g.: ES2015 and IE11
                     */
                    if (minimumBrowserVersion === 'none' && minimumTargettedBrowserVersion) {
                        return false;
                    }

                    /**
                     *  `isOlder` checks if it's strictly older. We do
                     * `!isOlder(minimumTargettedBrowserVersion, minimumBrowserVersion)` instead of
                     * `isOlder(minimumBrowserVersion, minimumTargettedBrowserVersion)`
                     * just in case they are the same version
                     */
                    const newer = !isOlder(minimumTargettedBrowserVersion, minimumBrowserVersion);

                    return valid && newer;
                }, true);

                maxVersion = validates ? version : maxVersion;
            });

            return maxVersion;
        };

        /**
         * Returns the configured normalized target:
         *
         * * The `es` part will be upper cased (e.g.: ES2015, ESNext)
         * * ES6 --> ES2015
         */
        const getConfiguredTarget = (config: TypeScriptConfig): string => {
            const target = config.compilerOptions.target;

            return Targets.get(target.toLowerCase());
        };

        const validate = async (evt: TypeScriptConfigParse) => {
            const { config, getLocation, resource } = evt;
            const { targetedBrowsers } = context;
            const target = getConfiguredTarget(config);
            const minimumBrowsers = toMiniumBrowser(targetedBrowsers);

            const maxESVersion = getMaxVersion(minimumBrowsers);

            if (maxESVersion !== target) {
                await context.report(resource, null, `Based on your browser configuration your "compilerOptions.target" should be "${maxESVersion}". Current one is "${target}"`, null, getLocation('compilerOptions.target'));
            }
        };

        context.on('parse::typescript-config::end', validate);
    }
}
