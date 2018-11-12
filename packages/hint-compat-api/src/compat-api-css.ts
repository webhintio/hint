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
import { MDNTreeFilteredByBrowsers, BrowserSupportCollection } from './types';
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

        const checkDeprecatedCSSFeature = (keyName: string, name: string, data: MDNTreeFilteredByBrowsers, browsersToSupport: BrowserSupportCollection, resource: string, location?: ProblemLocation, children?: string): void => {
            const key: any = data[keyName];
            let [prefix, featureName] = compatApi.getPrefix(name);

            if (!key) {
                debug('Error: The keyname does not exist.');

                return;
            }

            let feature = key[featureName];

            // If feature is not in the filtered by browser data, that means that is always supported.
            if (!feature) {
                return;
            }

            if (children) {
                [prefix, featureName] = compatApi.getPrefix(children);
                feature = feature[featureName];

                if (!feature) {
                    return;
                }
            }

            // Check if feature was tested
            if (cachedFeatures.isCached(featureName)) {
                cachedFeatures.showCachedErrors(featureName, context);

                return;
            }

            cachedFeatures.add(featureName);

            // If feature does not have compat data, we ignore it.
            const featureInfo = feature.__compat;

            if (!featureInfo) {
                return;
            }

            // Check for each browser the support block
            const supportBlock: SupportBlock = featureInfo.support;

            Object.entries(supportBlock).forEach(([browserToSupportName, browserInfo]) => {
                if (!Object.keys(browsersToSupport).some((browser) => {
                    return browser === browserToSupportName;
                })) {
                    return;
                }

                const browserFeatureSupported = compatApi.getSupportStatementFromInfo(browserInfo, prefix);

                // If we dont have information about the compatibility, its an error.
                if (!browserFeatureSupported) {
                    let wasSupportedInSometime = false;

                    Object.entries(browsersToSupport).forEach(([browserName, versions]) => {
                        if (browserName !== browserToSupportName) {
                            return;
                        }

                        wasSupportedInSometime = true;
                    });

                    if (!wasSupportedInSometime && Object.keys(browsersToSupport).includes(browserToSupportName)) {
                        const message = `${featureName} of CSS was never supported on any of your browsers to support.`;

                        cachedFeatures.addError(featureName, resource, message, location);
                        context.report(resource, null, message, featureName, location);
                    }

                    return;
                }

                const removedVersion = browserFeatureSupported.version_removed;

                // If there is no removed version, it is not deprecated.
                if (!removedVersion) {
                    return;
                }

                // Not a common case, but if removed version is exactly true, is always deprecated.
                if (removedVersion === true) {
                    const message = `${featureName} of CSS is not supported on ${browserToSupportName} browser.`;

                    cachedFeatures.addError(featureName, resource, message, location);
                    context.report(resource, null, message, featureName, location);

                    return;
                }

                // If the version is bigger than the browser supported, should fail
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

                    cachedFeatures.addError(featureName, resource, message, location);
                    context.report(resource, null, message, featureName, location);
                }
            });
        };

        const compatCSS = new CompatCSS(checkDeprecatedCSSFeature);

        const onParseCSS = (styleParse: StyleParse): void => {
            const { resource } = styleParse;

            compatCSS.searchCSSFeatures(compatApi.compatDataApi, mdnBrowsersCollection, styleParse, resource);
        };

        context.on('parse::css::end', onParseCSS);
    }
}
