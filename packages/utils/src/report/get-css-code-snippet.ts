import { ChildNode } from 'postcss';

const getNodeCodeSnippet = (node: ChildNode): string => {
    switch (node.type) {
        case 'rule':
            return `${node.selector.split(/,\s*/).join(`,\n`)}`;
        case 'decl':
            return `${node.prop}: ${node.value}`;
        case 'atrule':
            return `@${node.name} ${node.params}`;
        case 'comment':
            return `/* ${node.text} */`;
        default:
            return '';
    }
};

/**
 * Generate a Snippet code for a CSS node.
 *
 * Examples:
 *
 * Node type `rule`:
 *
 *     .selector { }
 *
 * Node type `decl`
 *
 *     .selector {
 *         prop: value;
 *     }
 *
 * Node type `comment`
 *
 *      /* comment * / (the space is intentional to not break the comment)
 *
 * Node type `atrule`
 *
 *     @keyframe name { }
 *
 * Node type `rule` inside `atrule`
 *
 *     @support (display: grid) {
 *         .selector { }
 *     }
 *
 * Node type `decl` inside `atrule`
 *
 *     @support (display: grid) {
 *         .selector {
 *             prop: value;
 *         }
 *     }
 * @param node - Node to generate the snippet code
 */
export const getCSSCodeSnippet = (node: ChildNode): string => {
    const hasChildren = 'nodes' in node && node.nodes && node.nodes.length;
    const defaultSuffix = node.type === 'comment' ? '' : ';';
    const suffix = hasChildren ? ' { }' : defaultSuffix;

    let result = `${getNodeCodeSnippet(node)}${suffix}`;
    let parent = node.parent;

    while (parent && parent.type !== 'root') {
        // Indent all child content by four spaces.
        const content = result.replace(/^/gm, '    ');

        result = `${getNodeCodeSnippet(parent)} {\n${content}\n}`;
        parent = parent.parent;
    }

    return result;
};
