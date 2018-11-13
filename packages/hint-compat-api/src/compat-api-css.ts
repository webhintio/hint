/**
 * @fileoverview Hint to validate if the HTML, CSS and JS APIs of the project are deprecated or not broadly supported
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata, ProblemLocation } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { StyleParse } from '@hint/parser-css/dist/src/types';
import { CompatApi, userBrowsers, CompatCSS, CachedCompatFeatures } from './helpers';
import { MDNTreeFilteredByBrowsers, BrowserSupportCollection, StrategyData } from './types';
import { SupportBlock } from './types-mdn.temp';
import { browserVersions } from './helpers/normalize-version';

const debug: debug.IDebugger = d(__filename);

/*
 * ------------------------------------------------------------------------------
 * Public
 * ------------------------------------------------------------------------------
 */

export default class implements IHint {

    public static readonly meta: HintMetadata = {
        docs: {
            category: Category.interoperability,
            description: `Hint to validate if the CSS features of the project are deprecated`
        },
        id: 'compat-api-css',
        schema: [],
        scope: HintScope.any
    }

    public constructor(context: HintContext) {
        const mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
        const compatApi = new CompatApi('css', mdnBrowsersCollection);
        const cachedFeatures = new CachedCompatFeatures();

        const checkDeprecatedCSSFeature = (strategyName: string, featureNameWithPrefix: string, data: MDNTreeFilteredByBrowsers, browsersToSupport: BrowserSupportCollection, resource: string, location?: ProblemLocation, optionalChildrenNameWithPrefix?: string): void => {
            const strategyData = validateStrategy(strategyName, featureNameWithPrefix, data, optionalChildrenNameWithPrefix);

            if (!strategyData) {
                return;
            }

            const { prefix, featureInfo, featureName } = strategyData;

            if (cachedFeatures.isCached(featureName)) {
                cachedFeatures.showCachedErrors(featureName, context);

                return;
            }

            cachedFeatures.add(featureName);


            // Check for each browser the support block
            const supportBlock: SupportBlock = featureInfo.support;

            Object.entries(supportBlock).forEach(([browserToSupportName, browserInfo]) => {
                testFeatureIsSupportedInBrowser(browsersToSupport, browserToSupportName, browserInfo, featureName, resource, prefix, location);
            });
        };

        const validateStrategy = (strategyName: string, featureNameWithPrefix: string, data: MDNTreeFilteredByBrowsers, optionalChildrenNameWithPrefix?: string): StrategyData | undefined => {
            let [prefix, featureName] = compatCSS.getPrefix(featureNameWithPrefix);

            const strategyContent: any = data[strategyName];

            if (!strategyContent) {
                debug('Error: The strategy does not exist.');

                return;
            }

            let feature = strategyContent[featureName];

            // If feature is not in the filtered by browser data, that means that is always supported.
            if (!feature) {
                return;
            }


            if (optionalChildrenNameWithPrefix) {
                [prefix, featureName] = compatCSS.getPrefix(optionalChildrenNameWithPrefix);
                feature = feature[featureName];

                if (!feature) {
                    return;
                }
            }

            // If feature does not have compat data, we ignore it.
            const featureInfo = feature.__compat;

            if (!featureInfo || !featureInfo.support) {
                return;
            }

            return {
                prefix,
                featureInfo,
                featureName
            };
        };

        const testFeatureIsSupportedInBrowser = (browsersToSupport: BrowserSupportCollection, browserToSupportName: string, browserInfo: any, featureName: string, resource: string, prefix?: string, location?: ProblemLocation): void => {
            if (!Object.keys(browsersToSupport).some((browser) => {
                return browser === browserToSupportName;
            })) {
                return;
            }

            const browserFeatureSupported = compatApi.getSupportStatementFromInfo(browserInfo, prefix);

            // If we dont have information about the compatibility, its an error.
            if (!browserFeatureSupported) {
                if (!wasBrowserSupportedInSometime(browsersToSupport, browserToSupportName) && Object.keys(browsersToSupport).includes(browserToSupportName)) {
                    const message = `${featureName} of CSS was never supported on any of your browsers to support.`;
                    reportError(featureName, message, resource, location);
                }

                return;
            }

            // Review: move outside
            const removedVersion = browserFeatureSupported.version_removed;

            // If there is no removed version, it is not deprecated.
            if (!removedVersion) {
                return;
            }

            // Not a common case, but if removed version is exactly true, is always deprecated.
            if (removedVersion === true) {
                const message = `${featureName} of CSS is not supported on ${browserToSupportName} browser.`;
                reportError(featureName, message, resource, location);

                return;
            }

            // If the version is bigger than the browser supported, should fail

            // Review: move
            const removedVersionNumber = browserVersions.normalize(removedVersion);
            const notSupportedVersions: string[] = [];

            Object.entries(browsersToSupport).forEach(([browserName, versions]) => {
                if (browserName !== browserToSupportName) {
                    return;
                }

                versions.forEach((version) => {
                    if (version < removedVersionNumber) {
                        return;
                    }

                    notSupportedVersions.push(`${browserName} ${browserVersions.deNormalize(version)}`);
                });
            });

            if (notSupportedVersions.length > 0) {
                const usedPrefix = prefix ? `prefixed with ${prefix} ` : '';
                const message = `${featureName} ${usedPrefix ? usedPrefix : ''}is not supported on ${notSupportedVersions.join(', ')} browsers.`;

                reportError(featureName, message, resource, location);
            }
        };

        const wasBrowserSupportedInSometime = (browsersToSupport: BrowserSupportCollection, browserToSupportName: string): boolean => {
            return Object.entries(browsersToSupport).some(([browserName]) => {
                if (browserName !== browserToSupportName) {
                    return false;
                }

                return true;
            });
        };

        const reportError = (featureName: string, message: string, resource: string, location?: ProblemLocation): void => {
            cachedFeatures.addError(featureName, resource, message, location);
            context.report(resource, null, message, featureName, location);
        };

        const compatCSS = new CompatCSS(checkDeprecatedCSSFeature);

        const onParseCSS = (styleParse: StyleParse): void => {
            const { resource } = styleParse;

            compatCSS.searchCSSFeatures(compatApi.compatDataApi, mdnBrowsersCollection, styleParse, resource);
        };

        context.on('parse::css::end', onParseCSS);
    }
}
