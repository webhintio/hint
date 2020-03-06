import { HTMLAnchorElement } from './elements/htmlanchorelement';
import { HTMLBodyElement } from './elements/htmlbodyelement';
import { HTMLHtmlElement } from './elements/htmlhtmlelement';
import { HTMLElement } from './htmlelement';
import { HTMLDocument } from './htmldocument';
import { ElementData } from './types';

const getElementType = (name: string): typeof HTMLElement => {
    switch (name) {
        case 'a':
            return HTMLAnchorElement;
        case 'body':
            return HTMLBodyElement;
        case 'html':
            return HTMLHtmlElement;
        default:
            return HTMLElement;
    }
};

/**
 * Used internally by utils-dom to create instances of the correct sub-type
 * deriving from HTMLElement based on the provided data.
 */
export const createElement = (name: string, owner: HTMLDocument, data?: ElementData): HTMLElement => {
    const ElementType = getElementType(name);

    return new ElementType(data || {
        attribs: {},
        children: [],
        name: name.toLowerCase(),
        namespace: 'http://www.w3.org/1999/xhtml',
        next: null,
        parent: null,
        prev: null,
        type: 'tag',
        'x-attribsNamespace': {},
        'x-attribsPrefix': {}
    }, owner);
};
