import { DocumentData, ElementData } from './types';

// Per contexts in which elements can be used in https://html.spec.whatwg.org/
const EXPECTED_PARENTS = new Map([
    ['col', 'colgroup'],
    ['dd', 'dl'],
    ['dt', 'dl'],
    ['legend', 'fieldset'],
    ['li', 'ul'],
    ['optgroup', 'select'],
    ['option', 'select'],
    ['tbody', 'table'],
    ['td', 'tr'],
    ['tfoot', 'table'],
    ['th', 'tr'],
    ['thead', 'table'],
    ['tr', 'table']
]);

const appendElement = (parent: ElementData, element: ElementData) => {
    if (element.next) {
        element.next.prev = parent;
    }
    if (element.prev) {
        element.prev.next = element.next;
    }
    if (element.parent) {
        element.parent.children = element.parent.children.filter((e) => {
            return e !== element;
        });
    }

    const last = parent.children[parent.children.length - 1];

    last.next = element;
    element.next = null;
    element.prev = last;
    element.parent = parent;
    parent.children.push(element);
};

const wrapElement = (element: ElementData, wrapperName: string): ElementData => {
    const parent: ElementData = {
        attribs: {},
        children: [element],
        name: wrapperName,
        namespace: 'http://www.w3.org/1999/xhtml',
        next: element.next,
        parent: element.parent,
        prev: element.prev,
        type: 'tag',
        'x-attribsNamespace': {},
        'x-attribsPrefix': {}
    };

    if (element.parent) {
        element.parent.children = element.parent.children.map((child) => {
            return child === element ? parent : child;
        });
    }
    if (element.next) {
        element.next.prev = parent;
    }
    if (element.prev) {
        element.prev.next = parent;
    }

    element.parent = parent;
    element.next = null;
    element.prev = null;

    return parent;
};

/**
 * When processing template fragments, wrap top level elements in
 * expected parent nodes (e.g. wrap `<li>` with `<ul>`) to allow
 * hints to validate structure without individually handling fragments.
 *
 * @param document Data representing a document created from a fragment.
 */
export const ensureExpectedParentNodes = (document: DocumentData) => {
    const html = document.children.find((child) => {
        return child.type === 'tag' && child.name === 'html';
    }) as ElementData;
    const body = html.children.find((child) => {
        return child.type === 'tag' && child.name === 'body';
    }) as ElementData;
    const topElements = body.children.filter((c) => {
        return c.type === 'tag';
    }) as ElementData[];

    let parent: ElementData | null = null;

    for (const element of topElements) {
        const expectedParent = EXPECTED_PARENTS.get(element.name);

        if (expectedParent) {
            if (parent?.name === expectedParent) {
                appendElement(parent, element); // re-use common parents
            } else {
                parent = wrapElement(element, expectedParent);
                topElements.push(parent); // recursively process created parents
            }
        }
    }
};
