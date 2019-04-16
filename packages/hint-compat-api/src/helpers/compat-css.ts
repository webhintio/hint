/**
 * @fileoverview Helper that contains all the logic related with CSS compat api, to use in different modules.
 */

import find = require('lodash/find');
import { AtRule, Rule, Declaration, ChildNode, ContainerBase } from 'postcss';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { ProblemLocation } from 'hint/dist/src/lib/types';
import { debug as d } from '@hint/utils/dist/src/debug';
import { getCSSCodeSnippet } from '@hint/utils/dist/src/misc/get-css-code-snippet';
import { StyleParse, StyleEvents } from '@hint/parser-css/dist/src/types';

import { FeatureStrategy, TestFeatureFunction, FeatureInfo, MDNTreeFilteredByBrowsers, FeatureAtSupport, TestFeatureOptions } from '../types';
import { CompatStatement } from '../types-mdn.temp';
import { CompatBase } from './compat-base';
import { evaluateQuery } from './evaluate-query';

const debug: debug.IDebugger = d(__filename);

export const DEFAULT_CSS_IGNORE = ['cursor'];

export class CompatCSS extends CompatBase<StyleEvents, StyleParse> {
    public constructor(hintContext: HintContext<StyleEvents>, MDNData: MDNTreeFilteredByBrowsers, testFunction: TestFeatureFunction) {
        super(hintContext, MDNData, testFunction);

        hintContext.on('parse::end::css', this.onParse.bind(this));
    }

    public searchFeatures(parse: StyleParse): void {
        this.walk(parse.ast);
    }

    private onParse(parse: StyleParse) {
        const { resource } = parse;

        this.setResource(resource);

        this.searchFeatures(parse);
    }

    private getSupportFeature(featureString: string) {
        const featureRegex = /([^:]+):([^)]*)/g;
        const exec = featureRegex.exec(featureString);

        if (!exec) {
            return null;
        }

        return {
            property: exec[1],
            value: exec[2]
        };
    }

    /**
     * Transform the condition of a @support block to an array of {prop: string, value: string}
     * e.g. (display: table-cell) and ((display: list-item) and (display:run-in))
     */
    private getSupportFeatures(conditionsString: string): (FeatureAtSupport | null)[] {
        const conditionRegex = /(selector)?\(([^()]+)\)/gi;
        const conditions = [];

        let exec = conditionRegex.exec(conditionsString);

        while (exec) {
            // Ignore selector();
            if (!exec[1]) {
                conditions.push(exec[2]);
            }

            exec = conditionRegex.exec(conditionsString);
        }

        return conditions.map(this.getSupportFeature);
    }

    private validateSupportFeatures(params: string, location: ProblemLocation | undefined): boolean {
        const features = this.getSupportFeatures(params);
        // Ignore selector(...)
        let query = params;

        for (const feature of features) {
            if (!feature) {
                continue;
            }

            const featureNode = {
                prop: feature.property.trim(),
                type: 'decl',
                value: feature.value.trim()
            } as ChildNode;

            const featureStrategy = this.chooseStrategyToSearchCSSFeature(featureNode);
            const featureSupported = featureStrategy.testFeature(featureNode, location, { skipReport: true });

            query = query.replace(`(${feature.property}:${feature.value})`, featureSupported.toString());
        }

        // Remove empty spaces between selector/not and the next statement
        query = query.replace(/selector\s*/g, 'selector');
        query = query.replace(/not\s*/gi, 'not');
        const valid = evaluateQuery(query);

        return valid;
    }

    /**
     * Walk through the nodes.
     *
     * Using a custom method instead of ast.walk() because
     * if the browser doesn't support @support or it considition,
     * we have to skip the node and it children.
     */
    private walk(ast: ContainerBase) {
        const nodes: ChildNode[] | undefined = ast.nodes;

        if (!nodes) {
            return;
        }

        for (const node of nodes) {
            const strategy = this.chooseStrategyToSearchCSSFeature(node);
            const location = this.getProblemLocationFromNode(node);

            if (node.type === 'atrule' && node.name === 'supports') {
                const supported = strategy.testFeature(node, location, { skipReport: true });

                // If browser doesn't support @support ignore the @support block.
                if (!supported) {
                    continue;
                }

                const valid = this.validateSupportFeatures(node.params, location);

                // At least one feature is not supported.
                if (!valid) {
                    continue;
                }

                this.walk(node as ContainerBase);

                continue;
            }

            const codeSnippet = getCSSCodeSnippet(node);

            strategy.testFeature(node, location, { codeSnippet });

            this.walk(node as ContainerBase);
        }
    }

    private testFeature(strategyName: string, featureNameWithPrefix: string, location?: ProblemLocation, subfeatureNameWithPrefix?: string, options: TestFeatureOptions = {}): boolean {
        const collection: CompatStatement | undefined = this.MDNData[strategyName];

        if (!collection) {
            // Review: Throw an error
            debug('Error: The strategy does not exist.');

            return false;
        }

        const [prefix, name] = this.getPrefix(featureNameWithPrefix);
        const feature: FeatureInfo = { codeSnippet: options.codeSnippet, displayableName: name, location, name, prefix };

        if (subfeatureNameWithPrefix) {
            const [prefix, name] = this.getPrefix(subfeatureNameWithPrefix);

            feature.subFeature = { codeSnippet: options.codeSnippet, displayableName: name, name, prefix };
        }

        return this.checkFeatureCompatibility(feature, collection, options);
    }

    private getProblemLocationFromNode(node: ChildNode): ProblemLocation | undefined {
        const start = node.source && node.source.start;

        if (!start) {
            return undefined;
        }

        return {
            column: start.column - 1,
            line: start.line - 1
        };
    }

    private chooseStrategyToSearchCSSFeature(childNode: ChildNode): FeatureStrategy<ChildNode> {
        const atStrategy: FeatureStrategy<AtRule> = {
            check: (node) => {
                return node.type === 'atrule';
            },

            testFeature: (node: AtRule, location?: ProblemLocation, options?: TestFeatureOptions) => {
                return this.testFeature('at-rules', node.name, location, undefined, options);
            }
        };

        const ruleStrategy: FeatureStrategy<Rule> = {
            check: (node) => {
                return node.type === 'rule';
            },

            testFeature: (node: Rule, location?: ProblemLocation, options?: TestFeatureOptions) => {
                return this.testFeature('selectors', node.selector, location, undefined, options);
            }
        };

        const declarationStrategy: FeatureStrategy<Declaration> = {
            check: (node) => {
                return node.type === 'decl';
            },

            testFeature: (node: Declaration, location?: ProblemLocation, options?: TestFeatureOptions) => {
                return this.testFeature('properties', node.prop, location, undefined, options) &&
                    this.testFeature('properties', node.prop, location, node.value, options);
            }
        };

        const defaultStrategy: FeatureStrategy<ChildNode> = {
            check: () => {
                return true;
            },

            testFeature: () => {
                return false;
            }
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

    private getPrefix(name: string): [string | undefined, string] {
        const regexp = /-(moz|o|webkit|ms)-/gi;
        const matched = name.match(regexp);
        const prefix = matched && matched.length > 0 ? matched[0] : undefined;

        return prefix ? [prefix, name.replace(prefix, '')] : [prefix, name];
    }
}
