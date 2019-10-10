/**
 * @fileoverview webhint parser needed to analyze HTML contained within JSX files.
 */
import * as parse5 from 'parse5';
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter';
import { debug as d } from '@hint/utils/dist/src/debug';
import { HTMLDocument } from '@hint/utils/dist/src/dom/html';
import { restoreReferences } from '@hint/utils/dist/src/dom/snapshot';
import { DocumentData, ElementData, TextData } from '@hint/utils/dist/src/types/snapshot';
import { Parser } from 'hint/dist/src/lib/types';
import { Engine } from 'hint/dist/src/lib/engine';
import { HTMLEvents } from '@hint/parser-html';
import { JSXAttribute, JSXElement, JSXExpressionContainer, JSXText, Node, ScriptEvents } from '@hint/parser-javascript';

type ChildMap = Map<JSXElement, Array<ElementData | TextData>>;
type RootMap = Map<Node, ElementData>;

const debug: debug.IDebugger = d(__filename);

/**
 * Check if the provided `Node` is a native HTML element in JSX.
 */
const isNativeElement = (node: Node) => {
    if (node.type !== 'JSXElement') {
        return false;
    }

    /* istanbul ignore if */
    if (node.openingElement.name.type !== 'JSXIdentifier') {
        return false; // Ignore JSXMemberExpression and JSXNamespacedName.
    }

    const { name } = node.openingElement.name;

    return name[0] === name[0].toLowerCase(); // Ignore custom components.
};

/**
 * Check if the provided `Node` is a `JSXAttribute` or native HTML element.
 */
const isAttributeOrNativeElement = (node: Node) => {
    if (node.type === 'JSXAttribute') {
        return true;
    }

    return isNativeElement(node);
};

/**
 * Translate JS AST locations to HTML AST locations.
 */
const mapLocation = (node: Node, { startColumnOffset = 0 } = {}): parse5.Location => {
    // TODO: Remove `columnOffset` once `Problem` supports a range.
    return {
        endCol: node.loc && (node.loc.end.column) || -1,
        endLine: node.loc && node.loc.end.line || -1,
        endOffset: node.range && node.range[1] || -1,
        startCol: node.loc && (node.loc.start.column + startColumnOffset) || -1,
        startLine: node.loc && node.loc.start.line || -1,
        startOffset: node.range && node.range[0] || -1
    };
};

/**
 * Translate collections of `JSXAttribute`s to their HTML AST equivalent.
 */
const mapAttributes = (node: JSXElement) => {
    const attribs: { [name: string]: string } = {};
    const locations: parse5.AttributesLocation = {};

    for (const attribute of node.openingElement.attributes) {
        if (attribute.type !== 'JSXAttribute') {
            continue; // TODO: Do something useful with JSXSpreadAttribute instances.
        }
        /* istanbul ignore if */
        if (attribute.name.type !== 'JSXIdentifier') {
            continue;
        }
        /* istanbul ignore if */
        if (attribute.value && attribute.value.type !== 'Literal' && attribute.value.type !== 'JSXExpressionContainer') {
            continue;
        }

        const { name } = attribute.name;

        if (!attribute.value) {
            attribs[name] = '';
        } else if (attribute.value.type === 'JSXExpressionContainer') {
            attribs[name] = `{expression}`;
        } else {
            attribs[name] = `${attribute.value.value}`;
        }

        locations[name] = mapLocation(attribute);
    }

    return {
        attribs,
        attrs: locations,
        'x-attribsNamespace': {},
        'x-attribsPrefix': {}
    };
};

/**
 * Translate `JSXElement` instances (JS AST) to `ElementData` (HTML AST).
 */
const mapElement = (node: JSXElement, childMap: ChildMap): ElementData => {
    /* istanbul ignore if */
    if (node.openingElement.name.type !== 'JSXIdentifier') {
        throw new Error('Can only map elements with known names');
    }

    const { name } = node.openingElement.name;
    const { attrs, ...attribs } = mapAttributes(node);
    const children = childMap.get(node) || [];

    return {
        ...attribs,
        children,
        name,
        next: null,
        parent: null,
        prev: null,
        sourceCodeLocation: {
            attrs,
            endTag: node.closingElement ? mapLocation(node.closingElement) : undefined as any, // TODO: Fix types to allow undefined (matches parse5 behavior)
            startTag: {
                attrs,
                ...mapLocation(node.openingElement, { startColumnOffset: 1 })
            },
            ...mapLocation(node, { startColumnOffset: 1 })
        },
        type: 'tag'
    };
};

/**
 * Translate JSX expressions `{foo}` to text placeholders.
 */
const mapExpression = (node: JSXExpressionContainer): TextData => {
    return {
        data: '{expression}',
        next: null,
        parent: null,
        prev: null,
        sourceCodeLocation: mapLocation(node),
        type: 'text'
    };
};

/**
 * Translate `JSXText` instances (JS AST) to `TextData` (HTML AST).
 */
const mapText = (node: JSXText): TextData => {
    return {
        data: node.value,
        next: null,
        parent: null,
        prev: null,
        sourceCodeLocation: mapLocation(node),
        type: 'text'
    };
};

/**
 * Find the nearest parent which is a native HTML element.
 */
const getParentElement = (ancestors: Node[]) => {
    return ancestors
        .slice(0, -1) // Omit target node
        .reverse()
        .filter(isNativeElement)[0] as JSXElement | undefined;
};

/**
 * Find the nearest parent which is a native HTML element or an attribute.
 */
const getParentAttributeOrElement = (ancestors: Node[]) => {
    return ancestors
        .slice(0, -1) // Omit target node
        .reverse()
        .filter(isAttributeOrNativeElement)[0] as JSXAttribute | JSXElement | undefined;
};

/**
 * Queue a child to be added to the `ElementData` for the provided `JSXElement`.
 */
const addChild = (data: ElementData | TextData, parent: JSXElement, children: ChildMap) => {
    const list = children.get(parent) || [];

    list.push(data);
    children.set(parent, list);
};

/**
 * Generate an HTML document representing a fragment containing the
 * provided roots derived from the specified resource.
 */
const createHTMLFragment = (roots: RootMap, resource: string) => {
    const dom = parse5.parse(
        `<!doctype html><html data-webhint-fragment></html>`,
        { treeAdapter: htmlparser2Adapter }
    ) as DocumentData;

    const body = (dom.children[1] as ElementData).children[1] as ElementData;

    roots.forEach((root) => {
        body.children.push(root);
    });

    restoreReferences(dom);

    return new HTMLDocument(dom, resource);
};

export default class JSXParser extends Parser<HTMLEvents> {

    public constructor(engine: Engine<HTMLEvents & ScriptEvents>) {
        super(engine, 'jsx');

        engine.on('parse::end::javascript', ({ ast, resource, walk }) => {
            const roots: RootMap = new Map();
            const childMap: ChildMap = new Map();

            walk.ancestor(ast, {
                JSXElement(node, /* istanbul ignore next */ ancestors = []) {
                    if (!isNativeElement(node)) {
                        return;
                    }

                    const data = mapElement(node, childMap);
                    const parent = getParentElement(ancestors);

                    if (parent) {
                        addChild(data, parent, childMap);
                    } else {
                        roots.set(node, data);
                    }
                },
                JSXExpressionContainer(node, /* istanbul ignore next */ ancestors = []) {
                    const data = mapExpression(node);
                    const parent = getParentAttributeOrElement(ancestors);

                    if (parent && parent.type !== 'JSXAttribute') {
                        addChild(data, parent, childMap);
                    }
                },
                JSXText(node, /* istanbul ignore next */ ancestors = []) {
                    const data = mapText(node);
                    const parent = getParentElement(ancestors);

                    if (parent) {
                        addChild(data, parent, childMap);
                    }
                }
            });

            walk.onComplete(async () => {
                if (!roots.size) {
                    return; // No JSX content found.
                }

                await this.engine.emitAsync(`parse::start::html`, { resource });

                const document = createHTMLFragment(roots, resource);
                const html = `<!doctype html>\n${document.documentElement.outerHTML}`;

                debug('Generated HTML from JSX:', html);

                await this.engine.emitAsync('parse::end::html', { document, html, resource });
            });
        });
    }
}
