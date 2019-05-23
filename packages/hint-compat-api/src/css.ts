/**
 * @fileoverview Validate if CSS features used are supported in target browsers.
 */

import intersection = require('lodash/intersection');
import { vendor, AtRule, Rule, Declaration, ChildNode, ContainerBase } from 'postcss';

import { HintContext } from 'hint/dist/src/lib/hint-context';
import { IHint, ProblemLocation } from 'hint/dist/src/lib/types';
import { StyleEvents } from '@hint/parser-css/dist/src/types';
import { getUnsupported } from '@hint/utils/dist/src/compat';
import { getCSSCodeSnippet } from '@hint/utils/dist/src/report';

import { joinBrowsers } from './utils/browsers';
import { filterSupports } from './utils/filter-supports';
import { resolveIgnore } from './utils/ignore';

import meta from './meta/css';

type ReportData = {
    feature: string;
    node: ChildNode;
    unsupported: string[];
};

type ReportMap = Map<string, ReportData[]>;

type Context = {
    browsers: string[];
    ignore: Set<string>;
    report: (data: ReportData) => void;
    walk: (ast: ContainerBase, context: Context) => void;
};

const getLocationFromNode = (node: ChildNode): ProblemLocation | undefined => {
    const start = node.source && node.source.start;

    return start && {
        column: start.column - 1,
        line: start.line - 1
    };
};

const validateAtSupports = (node: AtRule, context: Context): void => {
    const supported = filterSupports(node.params, context.browsers);

    if (supported) {
        context.walk(node, { ...context, browsers: supported });
    }
};

const validateAtRule = (node: AtRule, context: Context): ReportData | null => {
    if (node.name === 'supports') {
        validateAtSupports(node, context);

        return null;
    }

    const unsupported = getUnsupported({ rule: node.name }, context.browsers);

    if (unsupported) {
        return { feature: `@${node.name}`, node, unsupported };
    }

    context.walk(node, context);

    return null;
};

const validateDeclValue = (node: Declaration, context: Context): ReportData | null => {
    const unsupported = getUnsupported({ property: node.prop, value: node.value }, context.browsers);

    if (unsupported) {
        return { feature: `${node.prop}: ${node.value}`, node, unsupported };
    }

    return null;
};

const validateDecl = (node: Declaration, context: Context): ReportData | null => {
    const property = node.prop;

    if (context.ignore.has(property) || context.ignore.has(`${property}: ${node.value}`)) {
        return null;
    }

    const unsupported = getUnsupported({ property }, context.browsers);

    if (unsupported) {
        return { feature: `${property}`, node, unsupported };
    }

    return validateDeclValue(node, context);
};

const validateRule = (node: Rule, context: Context): void => {
    /**
     * TODO: Validate selectors.
     *
     * Commented-out implementation generates too much noise. Need to
     * consider parsing the selector at this level instead of inside
     * `getUnsupported` so the report can contain just the part of
     * the selector that was not supported instead of the entire selector.
     *
     * Also need to handle multiple vendor-prefixed versions of certain
     * selectors in adjacent rules to avoid false positives. We may want to
     * start with pseudo-states like `:valid` only and leave pseudo-elements
     * like `::placeholder` for later.
     *
     * ```ts
     * const unsupported = getUnsupported({ selector: node.selector }, context.browsers);
     *
     * if (unsupported) {
     *     return { feature: `${node.selector}`, node, unsupported };
     * }
     * ```
     */

    context.walk(node, context);
};

/**
 * Filter reports for the same CSS feature (prefixed or not) and only emit
 * those for browsers that were unsupported in ALL reports in the same block,
 * favoring unprefixed reports (if any).
 */
const reportUnsupported = (reportsMap: ReportMap, context: Context): void => {
    for (const reports of reportsMap.values()) {

        // Remove browsers not included in ALL reports for this property.
        const unsupported = intersection(...reports.map((report) => {
            return report.unsupported;
        }));

        // Ignore if every browser passed at least one report for this property.
        if (!unsupported.length) {
            continue;
        }

        // Prefer reporting unprefixed reports (if any).
        const unprefixedReports = reports.filter(({node}) => {
            switch (node.type) {
                case 'atrule':
                    return !vendor.prefix(node.name);
                case 'decl':
                    return !vendor.prefix(node.prop) && !vendor.prefix(node.value);
                default:
                    return false;
            }
        });

        const finalReports = unprefixedReports.length ? unprefixedReports : reports;

        for (const report of finalReports) {
            context.report({ ...report, unsupported });
        }
    }
};

const walk = (ast: ContainerBase, context: Context) => {
    if (!ast.nodes) {
        return;
    }

    /*
     * Hold reports de-dupe within this block. Used to eliminate reports for
     * unsupported features when a supported vendor prefixed or unprefixed
     * version of the same feature also exists.
     */
    const reportsMap: ReportMap = new Map();

    for (const node of ast.nodes) {
        let key = '';
        let report: ReportData | null = null;

        switch (node.type) {
            case 'atrule':
                key = `@${vendor.unprefixed(node.name)} ${node.params}`;
                report = validateAtRule(node, context);
                break;
            case 'comment':
                break; // Ignore comment nodes.
            case 'decl':
                key = `${vendor.unprefixed(node.prop)}`;
                report = validateDecl(node, context);
                break;
            case 'rule':
                validateRule(node, context);
                break;
            default:
                throw new Error('Unrecognized node type');
        }

        if (report) {
            const reports = reportsMap.get(key) || [];

            reports.push(report);
            reportsMap.set(key, reports);
        }
    }

    reportUnsupported(reportsMap, context);
};

export default class CSSCompatHint implements IHint {
    public static readonly meta = meta;

    public constructor(context: HintContext<StyleEvents>) {
        const ignore = resolveIgnore([
            '-moz-appearance: none',
            '-webkit-appearance: none',
            'appearance: none',
            'cursor'
        ], context.hintOptions);

        context.on('parse::end::css', ({ ast, element, resource }) => {
            // Ignore Android WebView due to outdated data in both browserslist and MDN.
            const browsers = context.targetedBrowsers.filter((browser) => {
                return !browser.startsWith('android');
            });

            const report = ({feature, node, unsupported}: ReportData) => {
                const message = `${feature} is not supported by ${joinBrowsers(unsupported)}.`;
                const codeSnippet = getCSSCodeSnippet(node);
                const location = getLocationFromNode(node);

                context.report(resource, message, { codeSnippet, element, location });
            };

            walk(ast, { browsers, ignore, report, walk });
        });
    }
}
