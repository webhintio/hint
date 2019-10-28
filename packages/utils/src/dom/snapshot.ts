import { ElementLocation } from 'parse5';

import { ChildData, DocumentData, ParentData } from '../types/snapshot';

/**
 * Inject and invoke within the context of a page to generate global
 * `webhint` helpers for creating DOM snapshots and resolving
 * unique IDs to `Node`s. Exposes:
 * * `__webhint.snapshotDocument(doc?: Document): DocumentData`
 * * `__webhint.findNode(id: number): Node`
 *
 * ```js
 * browser.devtools.inspectedWindow.eval(`(${createHelpers})()`);
 *
 * const snapshot = browser.devtools.inspectedWindow.eval('__webhint.snapshotDocument()');
 * ```
 */
/* istanbul ignore next */
export const createHelpers = () => {
    let nextId = 1;
    const idSymbol = Symbol('webhint-node-id');
    const HTMLNS = 'http://www.w3.org/1999/xhtml';

    /**
     * Retrieve the unique ID assigned to a `Node`,
     * creating a new one if no ID has been assigned yet.
     */
    const getId = (node: Node & { [idSymbol]?: number }): number => {
        if (!node[idSymbol]) {
            node[idSymbol] = nextId++;
        }

        return node[idSymbol]!;
    };

    /**
     * Retrieve the source code location for the provided node (if available).
     */
    const getLocation = (node: Node): ElementLocation | null => {
        const __webhint = (window as any).__webhint;

        if (__webhint && __webhint.nodeLocation) {
            return __webhint.nodeLocation(node);
        }

        return null;
    };

    /**
     * Find a node based on a previously assigned unique ID.
     */
    const findNode = (id: number, list = document.childNodes): Node | null => {
        for (const node of list) {
            if (getId(node) === id) {
                return node;
            } else if (node.childNodes) {
                const match = findNode(id, node.childNodes);

                if (match) {
                    return match;
                }
            }
        }

        return null;
    };

    const isComment = (node: Node): node is Comment => {
        return node.nodeType === 8;
    };

    const isDoctype = (node: Node): node is DocumentType => {
        return node.nodeType === 10;
    };

    const isDocumentFragment = (node: Node): node is DocumentFragment => {
        return node.nodeType === 11;
    };

    const isElement = (node: Node): node is Element => {
        return node.nodeType === 1;
    };

    const isTemplateElement = (element: Element): element is HTMLTemplateElement => {
        return element.localName === 'template' && element.namespaceURI === HTMLNS;
    };

    const isText = (node: Node): node is Text => {
        return node.nodeType === 3;
    };

    type AttrData = {
        attribs: { [name: string]: string };
        'x-attribsNamespace': { [name: string]: string };
        'x-attribsPrefix': { [name: string]: string };
    };

    /**
     * Snapshot attribute data in the modified `htmlparser2` format
     * used by `parse5-htmlparser2-tree-adapter` (which accounts for
     * namespaces).
     */
    const snapshotAttr = (data: AttrData, attr: Attr): AttrData => {
        data.attribs[attr.name] = attr.value;
        if (attr.namespaceURI !== null) {
            data['x-attribsNamespace'][attr.name] = attr.namespaceURI;
        }
        if (attr.prefix !== null) {
            data['x-attribsPrefix'][attr.name] = attr.prefix;
        }

        return data;
    };

    /**
     * Recursively snapshot the data for the provided `Node` in the
     * modified `htmlparser2` format used by
     * `parse5-htmlparser2-tree-adapter`.
     */
    const snapshot = (node: Node): ChildData => {
        const id = getId(node);
        const sourceCodeLocation = getLocation(node);

        if (isComment(node)) {
            return {
                data: node.nodeValue || '',
                id,
                next: null,
                parent: null,
                prev: null,
                sourceCodeLocation,
                type: 'comment'
            };
        } else if (isDoctype(node)) {
            return {
                data: node.nodeValue || '',
                id,
                name: '!doctype',
                next: null,
                nodeName: node.name,
                parent: null,
                prev: null,
                publicId: node.publicId,
                sourceCodeLocation,
                systemId: node.systemId,
                type: 'directive'
            };
        } else if (isDocumentFragment(node)) {
            return {
                children: Array.from(node.childNodes).map(snapshot),
                id,
                name: 'root',
                next: null,
                parent: null,
                prev: null,
                type: 'root'
            };
        } else if (isElement(node)) {
            const name = node.nodeName.toLowerCase();
            const attrs = Array.from(node.attributes).reduce(snapshotAttr, {
                attribs: {},
                'x-attribsNamespace': {},
                'x-attribsPrefix': {}
            });
            const children = isTemplateElement(node) ?
                [snapshot(node.content)] :
                Array.from(node.childNodes).map(snapshot);

            return {
                attribs: attrs.attribs,
                children,
                id,
                name,
                namespace: node.namespaceURI,
                next: null,
                parent: null,
                prev: null,
                sourceCodeLocation,
                type: name === 'script' || name === 'style' ? name : 'tag',
                'x-attribsNamespace': attrs['x-attribsNamespace'],
                'x-attribsPrefix': attrs['x-attribsPrefix']
            };
        } else if (isText(node)) {
            return {
                data: node.nodeValue || '',
                id,
                next: null,
                parent: null,
                prev: null,
                sourceCodeLocation,
                type: 'text'
            };
        }

        throw new Error(`Unexpected node type: ${node.nodeType}`);
    };

    /**
     * Recursively snapshot the DOM data for the provided `Document`
     * in the modified `htmlparser2` format used by
     * `parse5-htmlparser2-tree-adapter`.
     */
    const snapshotDocument = (doc = document): DocumentData => {
        return {
            children: Array.from(doc.childNodes).map(snapshot),
            name: 'root',
            type: 'root',
            'x-mode': document.compatMode === 'BackCompat' ? 'quirks' : 'no-quirks'
        };
    };

    // Export helpers for later use from external script.
    (window as any).__webhint = {
        ...(window as any).__webhint,
        findNode,
        snapshotDocument
    };
};

/**
 * Recursively rebuild parent and sibling references in a DOM snapshot.
 */
const restoreChildReferences = (node: ChildData, index: number, arr: ChildData[], parent: ParentData) => {
    node.next = arr[index + 1] || null;
    node.parent = parent;
    node.prev = arr[index - 1] || null;

    if ('children' in node) {
        node.children.forEach((n: ChildData, i: number, a: ChildData[]) => {
            restoreChildReferences(n, i, a, node);
        });
    }
};

/**
 * Rebuild parent and sibling references in a DOM snapshot.
 *
 * These are initially omitted from snapshots so the data can be
 * passed across contexts that require serialization to JSON.
 *
 * Once re-parsed these references must be set in order for helper
 * libraries like `css-select` to work.
 */
export const restoreReferences = (doc: DocumentData) => {
    doc.children.forEach((n, i, a) => {
        restoreChildReferences(n, i, a, doc);
    });
};
