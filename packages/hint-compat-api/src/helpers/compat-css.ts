/**
 * @fileoverview Helper that contains all the logic related with CSS compat api, to use in different modules.
 */

import find = require('lodash/find');
import { AtRule, Rule, Declaration, ChildNode, ContainerBase } from 'postcss';
import { HintContext } from 'hint/dist/src/lib/hint-context';
import { ProblemLocation } from 'hint/dist/src/lib/types';
import { debug as d } from '@hint/utils/dist/src/debug';
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

    private hasSemicolon(node: ChildNode): boolean {
        const source = node.source;

        if (!source || !source.end || !source.input) {
            return false;
        }

        // type NodeSource doesn't have the property css.
        const css = (source.input as any).css;

        if (!css) {
            return false;
        }

        const line = css.split('\n')[source.end.line - 1];

        return line[source.end.column - 1] === ';';
    }

    private getCodeSnippetPrefix(node: ChildNode): string {
        if (node.type === 'rule') {
            return `${node.raws.before}${node.selector}${node.raws.between}`;
        }

        if (node.type === 'atrule') {
            return `@${node.name}${node.raws.afterName}${node.params}${node.raws.between}`;
        }

        return '';
    }

    private getCodeSnippetContent(node: ChildNode, isFirstNode: boolean, currentContent: string): string {
        let numberOfSpaces = 4;
        const grandpa = node.parent ? node.parent.parent : null;

        if (grandpa && grandpa.type === 'atrule') {
            numberOfSpaces = 8;
        }

        const spaces = new Array(numberOfSpaces + 1).join(' ');

        return `${!isFirstNode ? `\n${spaces}…\n${spaces}` : ''}${!isFirstNode ? currentContent.replace(node.raws.before!, '') : currentContent}`;
    }

    private getCodeSnippetPostfix(node: ChildNode, isLastNode: boolean): string {
        let numberOfSpaces = 4;
        const grandpa = node.parent ? node.parent.parent : null;

        if (grandpa) {
            numberOfSpaces = 8;
        }

        const spaces = new Array(numberOfSpaces + 1).join(' ');

        return `${!isLastNode ? `\n${spaces}…` : ''}${node.raws.after}`;
    }

    /**
     * Generate a Snippet code for a CSS node.
     *
     * Examples:
     *
     * Node type `rule`:
     *     .selector { … }
     *
     * Node type `decl`
     *
     *     .selector {
     *         prop: value;
     *     }
     *
     *     .selector {
     *         prop: value;
     *         …
     *     }
     *
     *     .selector {
     *         …
     *         prop: value;
     *     }
     *
     * Node type `rule` inside `atrule`
     *     @support (display: grid) {
     *         .selector { … }
     *     }
     *
     *     @support (display: grid) {
     *         …
     *         .selector { … }
     *     }
     *
     *     @support (display: grid) {
     *         .selector { … }
     *         …
     *     }
     *
     * Node type `decl` inside `atrule`
     *     @support (display: grid) {
     *         .selector {
     *             prop: value;
     *         }
     *     }
     *
     *     @support (display: grid) {
     *         .selector {
     *             …
     *             prop: value;
     *         }
     *     }
     *
     *     @support (display: grid) {
     *         .selector {
     *             prop: value;
     *             …
     *         }
     *     }
     *
     *     @support (display: grid) {
     *         …
     *         .selector {
     *             …
     *             prop: value;
     *         }
     *     }
     * @param node - Node to generate the snippet code
     */
    private generateCodeSnippet(node: ChildNode): string {
        let result = '';

        switch (node.type) {
            case 'rule':
                result = `${node.raws.before}${node.selector} { … }`;
                break;
            case 'decl':
                result = `${node.raws.before}${node.prop}${node.raws.between}${node.value}${this.hasSemicolon(node) ? ';' : ''}`;
                break;
            default:
        }

        let parent = node.parent;
        let child = node;

        while (parent && parent.type !== 'root') {
            const nodes = parent.nodes!;
            const nodePosition = nodes.findIndex((childNode) => { // eslint-disable-line no-loop-func
                return childNode === child;
            });
            const isFirstNode = nodePosition === 0;
            const isLastNode = nodePosition === (nodes.length - 1);

            result = `${this.getCodeSnippetPrefix(parent)}{${this.getCodeSnippetContent(child, isFirstNode, result)}${this.getCodeSnippetPostfix(parent, isLastNode)}}`;

            child = parent;
            parent = parent.parent;
        }

        result = result.trim();

        return result;
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

            const codeSnippet = this.generateCodeSnippet(node);

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
