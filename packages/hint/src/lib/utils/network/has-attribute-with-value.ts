import { IAsyncHTMLElement } from '../../types';

export default (element: IAsyncHTMLElement, nodeName: string, attribute: string, value: string): boolean => {
    if (!element || element.nodeName.toLowerCase() !== nodeName.toLowerCase()) {
        return false;
    }

    const relAttribute: string | null = element.getAttribute(attribute);

    if (!relAttribute) {
        return false;
    }

    const rels: Array<string> = relAttribute.toLowerCase()
        .split(' ');

    return rels.some((rel) => {
        return rel === value;
    });
};
