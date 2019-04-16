import { ChildNode } from 'postcss';

const getCodeSnippetPrefix = (node: ChildNode): string => {
    if (node.type === 'rule') {
        return `${node.selector} {`;
    }

    if (node.type === 'atrule') {
        return `@${node.name} ${node.params} {`;
    }

    return '';
};

const getCodeSnippetContent = (node: ChildNode, content: string): string => {
    let numberOfSpaces = 4;
    const grandpa = node.parent ? node.parent.parent : null;

    if (grandpa && grandpa.type === 'atrule') {
        numberOfSpaces = 8;
    }

    const spaces = new Array(numberOfSpaces + 1).join(' ');

    return `${spaces}${content}`;
};

const getCodeSnippetPostfix = (node: ChildNode): string => {
    let numberOfSpaces = 0;
    const grandpa = node.parent ? node.parent.parent : null;

    if (grandpa) {
        numberOfSpaces = 4;
    }

    const spaces = new Array(numberOfSpaces + 1).join(' ');

    return `${spaces}}`;
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
    let result = '';

    switch (node.type) {
        case 'rule':
            result = `${node.selector} { }`;
            break;
        case 'decl':
            result = `${node.prop}: ${node.value};`;
            break;
        case 'atrule':
            result = `@${node.name} ${node.params} { }`;
            break;
        case 'comment':
            result = `/* ${node.text} */`;
            break;
        default:
    }

    let parent = node.parent;
    let child = node;

    while (parent && parent.type !== 'root') {
        result = `${getCodeSnippetPrefix(parent)}
${getCodeSnippetContent(child, result)}
${getCodeSnippetPostfix(parent)}`;

        child = parent;
        parent = parent.parent;
    }

    return result;
};
