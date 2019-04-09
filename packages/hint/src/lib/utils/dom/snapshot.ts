import { NodeData } from '../types/snapshot';

export const inject = () => {
    let nextId = 1;
    const nodeIds = new WeakMap<Node, number>();

    const getId = (node: Node): number => {
        if (nodeIds.has(node)) {
            return nodeIds.get(node)!;
        }

        const id = nextId++;

        nodeIds.set(node, id);

        return id;
    };

    const findNode = (id: number, list: Iterable<Node>): Node | null => {
        for (const node of list) {
            if (nodeIds.get(node) === id) {
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

    const snapshotAttr = (obj, attr: Attr) => {
        obj.attribs[attr.name] = attr.value;
        obj['x-attribsNamespace'][attr.name] = attr.namespaceURI;
        obj['x-attribsPrefix'][attr.name] = attr.prefix;

        return obj;
    };

    const snapshot = (node: Node): NodeData => {
        const id = getId(node);

        if (node instanceof Comment) {
            return {
                data: node.nodeValue,
                id,
                next: null,
                parent: null,
                prev: null,
                type: 'comment'
            };
        } else if (node instanceof Document) {
            return {
                children: Array.from(node.childNodes).map(snapshot),
                name: 'root',
                type: 'root',
                'x-mode': document.compatMode === 'BackCompat' ? 'quirks' : 'no-quirks'
            };
        } else if (node instanceof DocumentType) {
            return {
                data: node.nodeValue,
                id,
                name: '!doctype',
                nodeName: node.name,
                publicId: node.publicId,
                systemId: node.systemId,
                type: 'directive'
            };
        } else if (node instanceof Element) {
            const name = node.nodeName.toLowerCase();
            const attrs = Array.from(node.attributes).reduce(snapshotAttr, {
                attribs: {},
                'x-attribsNamespace': {},
                'x-attribsPrefix': {}
            });

            return {
                attribs: attrs.attribs,
                children: Array.from(node.childNodes).map(snapshot),
                id,
                name,
                namespace: node.namespaceURI,
                next: null,
                parent: null,
                prev: null,
                type: name === 'script' || name === 'style' ? name : 'tag',
                'x-attribsNamespace': attrs['x-attribsNamespace'],
                'x-attribsPrefix': attrs['x-attribsPrefix']
            };
        } else if (node instanceof Text) {
            return {
                data: node.nodeValue,
                id,
                next: null,
                parent: null,
                prev: null,
                type: 'text'
            };
        }

        throw new Error(`Unexpected node type: ${node.nodeType}`);
    };

    const win = window as any;

    win.__webhint__ = win.__webhint__ || {};
    win.__webhint__.findNode = findNode;
};

export const setReferences = (node: NodeData, index: number, arr: NodeData[], parent?: NodeData) => {
    node.next = arr[index + 1] || null;
    node.parent = parent;
    node.prev = arr[index - 1] || null;

    if (node.children) {
        node.children.forEach((n: NodeData, i: number, a: NodeData[]) => {
            setReferences(n, i, a, node);
        });
    }
};
