/**
 * @fileoverview Helper that contains all the logic related with CSS compat api, to use in different modules.
 */

import { debug as d } from 'hint/dist/src/lib/utils/debug';
import { StyleParse } from '@hint/parser-css/dist/src/types';
import { ProblemLocation } from 'hint/dist/src/lib/types';
import { AtRule, Rule, Declaration, ChildNode } from 'postcss';
import { find } from 'lodash';
import { FeatureStrategy, MDNTreeFilteredByBrowsers, BrowserSupportCollection, CSSTestFunction, StrategyData, BrowserVersions } from '../types';
import { CachedCompatFeatures } from './cached-compat-features';
import { SupportBlock } from '../types-mdn.temp';
import { HintContext } from 'hint/dist/src/lib/hint-context';

const debug: debug.IDebugger = d(__filename);

export class CompatCSS {
    private testFunction: CSSTestFunction | undefined;
    private cachedFeatures: CachedCompatFeatures;
    private hintContext: HintContext;
    private hintResource: string = 'unknown';

    public constructor(hintContext: HintContext, testFunction: CSSTestFunction) {
        if (!testFunction) {
            throw new Error('You must set test function before test a feature.');
        }

        this.testFunction = testFunction;
        this.hintContext = hintContext;
        this.cachedFeatures = new CachedCompatFeatures();
    }

    public setResource(hintResource: string): void {
        this.hintResource = hintResource;
    }

    private getProblemLocationFromNode(node: ChildNode): ProblemLocation | undefined {
        const start = node.source.start;

        if (!start) {
            return undefined;
        }

        return {
            column: start.column,
            line: start.line
        };
    }

    public searchCSSFeatures(data: MDNTreeFilteredByBrowsers, browsers: BrowserSupportCollection, parse: StyleParse): void {
        parse.ast.walk((node: ChildNode) => {
            const strategy = this.chooseStrategyToSearchCSSFeature(node);
            const location = this.getProblemLocationFromNode(node);

            strategy.testFeature(node, data, browsers, location);
        });
    }

    public chooseStrategyToSearchCSSFeature(childNode: ChildNode): FeatureStrategy<ChildNode> {
        const atStrategy: FeatureStrategy<AtRule> = {
            check: (node) => {
                return node.type === 'atrule';
            },

            testFeature: (node: AtRule, data, browsers, location) => {
                this.testFeature('at-rules', node.name, data, browsers, location);
            }
        };

        const ruleStrategy: FeatureStrategy<Rule> = {
            check: (node) => {
                return node.type === 'rule';
            },

            testFeature: (node: Rule, data, browsers, location) => {
                this.testFeature('selectors', node.selector, data, browsers, location);
            }
        };

        const declarationStrategy: FeatureStrategy<Declaration> = {
            check: (node) => {
                return node.type === 'decl';
            },

            testFeature: (node: Declaration, data, browsers, location) => {
                this.testFeature('properties', node.prop, data, browsers, location);
                this.testFeature('properties', node.prop, data, browsers, location, node.value);
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
    }

    private testFeature(strategyName: string, featureNameWithPrefix: string, data: MDNTreeFilteredByBrowsers, browsersToSupport: BrowserSupportCollection, location?: ProblemLocation, optionalChildrenNameWithPrefix?: string): void {
        const strategyData = this.validateStrategy(strategyName, featureNameWithPrefix, data, optionalChildrenNameWithPrefix);

        if (!strategyData) {
            return;
        }

        const { prefix, featureInfo, featureName } = strategyData;

        if (this.cachedFeatures.isCached(featureName)) {
            this.cachedFeatures.showCachedErrors(featureName, this.hintContext, location);

            return;
        }

        this.cachedFeatures.add(featureName);

        // Check for each browser the support block
        const supportBlock: SupportBlock = featureInfo.support;

        Object.entries(supportBlock).forEach(([browserToSupportName, browserInfo]) => {
            if (!this.testFunction) {
                return;
            }

            this.testFunction(browsersToSupport, browserToSupportName, browserInfo, featureName, prefix, location);
        });
    }

    public validateStrategy(strategyName: string, featureNameWithPrefix: string, data: MDNTreeFilteredByBrowsers, optionalChildrenNameWithPrefix?: string): StrategyData | null {
        let [prefix, featureName] = this.getPrefix(featureNameWithPrefix);

        const strategyContent: any = data[strategyName];

        if (!strategyContent) {
            // Review: Throw an error
            debug('Error: The strategy does not exist.');

            return null;
        }

        let feature = strategyContent[featureName];

        // If feature is not in the filtered by browser data, that means that is always supported.
        if (!feature) {
            return null;
        }

        if (optionalChildrenNameWithPrefix) {
            [prefix, featureName] = this.getPrefix(optionalChildrenNameWithPrefix);
            feature = feature[featureName];

            if (!feature) {
                return null;
            }
        }

        // If feature does not have compat data, we ignore it.
        const featureInfo = feature.__compat;

        if (!featureInfo || !featureInfo.support) {
            return null;
        }

        return {
            featureInfo,
            featureName,
            prefix
        };
    }

    private getPrefix(name: string): [string | undefined, string] {
        const regexp = /-(moz|o|webkit|ms)-/gi;
        const matched = name.match(regexp);
        const prefix = matched && matched.length > 0 ? matched[0] : undefined;

        return prefix ? [prefix, name.replace(prefix, '')] : [prefix, name];
    }

    public reportError(featureName: string, message: string, location?: ProblemLocation): void {
        this.cachedFeatures.addError(featureName, this.hintResource, message, location);
        this.hintContext.report(this.hintResource, null, message, featureName, location);
    }

    public reportIfThereIsNoInformationAboutCompatibility(message: string, browsersToSupport: BrowserSupportCollection, browserToSupportName: string, featureName: string, location?: ProblemLocation) {
        if (!this.wasBrowserSupportedInSometime(browsersToSupport, browserToSupportName) && Object.keys(browsersToSupport).includes(browserToSupportName)) {
            this.reportError(featureName, message, location);
        }
    }

    public wasBrowserSupportedInSometime(browsersToSupport: BrowserSupportCollection, browserToSupportName: string): boolean {
        return Object.entries(browsersToSupport).some(([browserName]) => {
            if (browserName !== browserToSupportName) {
                return false;
            }

            return true;
        });
    }

    public generateNotSupportedVersionsError(featureName: string, notSupportedVersions: string[], statusName: string, prefix?: string): string {
        const usedPrefix = prefix ? `prefixed with ${prefix} ` : '';
        const groupedNotSupportedVersions = this.groupNotSupportedVersions(notSupportedVersions);

        return `${featureName} ${usedPrefix ? usedPrefix : ''}is not ${statusName} on ${groupedNotSupportedVersions.join(', ')} browser${notSupportedVersions.length > 1 ? 's' : ''}.`;
    }

    /**
     * @method groupNotSupportedVersions
     * Examples:
     * [ 'chrome 66', 'chrome 69' ] into ['chrome 66, 69']
     * [ 'chrome 67', 'chrome 68', 'chrome 69' ] into ['chrome 67-69']
     * [ 'chrome 66', 'chrome 68', 'chrome 69' ] into ['chrome 66, 67-69']
     *
     */
    private groupNotSupportedVersions(versions: string[]): string[] {
        if (!versions) {
            return [];
        }

        const browsers: BrowserVersions = {};
        versions.forEach((browserAndVersion: string) => {
            const [browser, version] = browserAndVersion.split(' ');

            browsers[browser] = browsers[browser] || [];
            browsers[browser].push(version);
        });

        const groupedVersions = Object.entries(browsers).map(([browser, versions]) => {
            const sortedVersions = versions.sort();
            let grouped = '';

            let groupStarted = false;
            sortedVersions.forEach((value, i) => {
                const nextValue = sortedVersions[i + 1];

                if (!groupStarted) {
                    grouped += `${browser} ${value}`;
                }

                if (nextValue && Number(nextValue) - Number(value) > 1) {
                    if (groupStarted) {
                        groupStarted = false;
                        grouped += value;
                    }

                    grouped += ', ';
                }

                if (!groupStarted && nextValue && Number(nextValue) - Number(value) === 1) {
                    groupStarted = true;
                    grouped += '-';
                }

                if (groupStarted && !nextValue) {
                    groupStarted = false;
                    grouped += value;
                }
            });

            return grouped;
        });

        return groupedVersions;
    }
}
