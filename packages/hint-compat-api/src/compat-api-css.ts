/**
 * @fileoverview Hint to validate if the HTML, CSS and JS APIs of the project are deprecated or not broadly supported
 */

import { Category } from 'hint/dist/src/lib/enums/category';
import { HintScope } from 'hint/dist/src/lib/enums/hintscope';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, HintMetadata } from 'hint/dist/src/lib/types';
import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { StyleParse } from '@hint/parser-css/dist/src/types';
import { AtRule, Rule, Declaration, ChildNode } from 'postcss';
import { find, forEach } from 'lodash';
import { CompatApi, userBrowsers } from './helpers';
import { FeatureStrategy, MDNTreeFilteredByBrowsers, BrowserSupportCollection } from './types';
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
        const onParseCSS = (styleParse: StyleParse): void => {
            const { resource } = styleParse;
            const mdnBrowsersCollection = userBrowsers.convert(context.targetedBrowsers);
            const compatApi = new CompatApi('css', mdnBrowsersCollection);

            const checkDeprecatedCSSFeature = (keyName: string, name: string, data: MDNTreeFilteredByBrowsers, browsersToSupport: BrowserSupportCollection): void => {
                const key: any = data[keyName];
                const [prefix, featureName] = compatApi.getPrefix(name);

                if (!key) {
                    debug('Error: The keyname does not exist.');

                    return;
                }

                const feature = key[featureName];

                // If feature is not in the filtered by browser data, that means that is always supported.
                if (!feature) {
                    return;
                }

                // If feature does not have compat data, we ignore it.
                const featureInfo = feature.__compat;

                if (!featureInfo) {
                    return;
                }

                // Check for each browser the support block
                const supportBlock: SupportBlock = featureInfo.support;

                forEach(supportBlock, (browserInfo, browserToSupportName) => {
                    const browserFeatureSupported = compatApi.getSupportStatementFromInfo(browserInfo, prefix);

                    // If we dont have information about the compatibility, its an error.
                    if (!browserFeatureSupported) {
                        let wasSupportedInSometime = false;

                        forEach(browsersToSupport, (versions, browserName) => {
                            if (browserName !== browserToSupportName) {
                                return;
                            }

                            wasSupportedInSometime = true;
                        });

                        if (!wasSupportedInSometime) {
                            context.report(resource, null, `${featureName} of CSS was never supported on ${browserToSupportName} browser.`, featureName);
                        }

                        return;
                    }

                    const removedVersion = browserFeatureSupported.version_removed;

                    // If there is no removed version, it is no deprecated.
                    if (!removedVersion) {
                        return;
                    }

                    // Not a common case, but if removed version is exactly true, is always deprecated.
                    if (removedVersion === true) {
                        context.report(resource, null, `${featureName} of CSS is not supported on ${browserToSupportName} browser.`, featureName);

                        return;
                    }

                    // If the version is smaller than the browser supported, should fail
                    const removedVersionNumber = browserVersions.normalize(removedVersion);
                    const notSupportedVersions: string[] = [];

                    forEach(browsersToSupport, (versions, browserName) => {
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
                        context.report(resource, null, `${featureName} of CSS is not supported on ${notSupportedVersions.join(', ')} browsers.`, featureName);
                    }
                });
            };

            const chooseStrategyToSearchDeprecatedCSSFeature = (childNode: ChildNode): FeatureStrategy<ChildNode> => {
                const atStrategy: FeatureStrategy<AtRule> = {
                    check: (node) => {
                        return node.type === 'atrule';
                    },

                    testFeature: (node: AtRule, data, browsers) => {
                        checkDeprecatedCSSFeature('at-rules', node.name, data, browsers);
                    }
                };

                const ruleStrategy: FeatureStrategy<Rule> = {
                    check: (node) => {
                        return node.type === 'rule';
                    },

                    testFeature: (node: Rule, data, browsers) => {
                        checkDeprecatedCSSFeature('selectors', node.selector, data, browsers);
                    }
                };

                const declarationStrategy: FeatureStrategy<Declaration> = {
                    check: (node) => {
                        return node.type === 'decl';
                    },

                    testFeature: (node: Declaration, data, browsers) => {
                        checkDeprecatedCSSFeature('properties', node.prop, data, browsers);
                    }
                };

                const defaultStrategy: FeatureStrategy<ChildNode> = {
                    check: () => {
                        return true;
                    },

                    testFeature: () => { }
                };

                const strategies = {
                    atStrategy,
                    declarationStrategy,
                    ruleStrategy
                };

                const selectedStrategy = find(strategies, (x) => {
                    return x.check(childNode);
                });

                // If no result return default strategy to be consistent
                if (!selectedStrategy) {
                    debug('Error: Compat api CSS cannot find valid strategies.');

                    return defaultStrategy;
                }

                return selectedStrategy as FeatureStrategy<ChildNode>;
            };

            const searchDeprecatedCSSFeatures = (data: MDNTreeFilteredByBrowsers, browsers: BrowserSupportCollection, parse: StyleParse) => {
                parse.ast.walk((node: ChildNode) => {
                    const strategy = chooseStrategyToSearchDeprecatedCSSFeature(node);

                    strategy.testFeature(node, data, browsers);
                });
            };

            searchDeprecatedCSSFeatures(compatApi.compatDataApi, mdnBrowsersCollection, styleParse);
        };

        context.on('parse::css::end', onParseCSS);
    }
}
