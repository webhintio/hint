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

const getChildrenCodeSnippet = (children: ChildNode[]): string => {
    let result = '';

    for (const child of children) {
        if ('nodes' in child && child.nodes && child.nodes.length) {
            result += `${getNodeCodeSnippet(child)} {
${getChildrenCodeSnippet(child.nodes).replace(/^/gm, '    ')}
}`;
        } else {
            result += `${getNodeCodeSnippet(child)}${child.type === 'comment' ? '' : ';'}\n`;
        }
    }

    return result.trim();
};

/**
 * Generate a Snippet code for a CSS node.
 *
 * Examples:
 *
 * Node type `rule`:
 *
 *     .selector {
 *         prop1: value;
 *         prop2: value;
 *     }
 *
 * Node type `decl`
 *
 *     .selector {
 *         prop1: value;
 *         prop2: value;
 *     }
 *
 * Node type `comment`
 *
 *      /* comment * / (the space is intentional to not break the comment)
 *
 * Node type `atrule`
 *
 *     @keyframe name {
 *         %0 {
 *             prop1: value;
 *             prop2: value;
 *         }
 *     }
 *
 * Node type `rule` inside `atrule`
 *
 *     @support (display: grid) {
 *         .selector {
 *             prop1: value;
 *             prop2: value;
 *         }
 *     }
 *
 * Node type `decl` inside `atrule`
 *
 *     @support (display: grid) {
 *         .selector {
 *             prop: value;
 *             prop: value;
 *         }
 *     }
 * @param node - Node to generate the snippet code
 */
export const getFullCSSCodeSnippet = (node: ChildNode): string => {
    const children = 'nodes' in node && node.nodes;
    const defaultSuffix = node.type === 'comment' ? '' : ';';

    let result: string;
    let parent = node.parent;

    if (parent && parent.type !== 'root') {
        const children = parent.nodes!;
        const content = getChildrenCodeSnippet(children);

        result = content;
    } else if (children) {
        result = `${getNodeCodeSnippet(node)} {
${getChildrenCodeSnippet(children).replace(/^/gm, '    ')}
}`;
    } else {
        result = `${getNodeCodeSnippet(node)}${defaultSuffix}`;
    }

    while (parent && parent.type !== 'root') {
        // Indent all child content by four spaces.
        const content = result.trim().replace(/^/gm, '    ');

        result = `${getNodeCodeSnippet(parent)} {\n${content}\n}`;
        parent = parent.parent;
    }

    return result;
};
