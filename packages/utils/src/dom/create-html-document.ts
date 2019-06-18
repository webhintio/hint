import * as parse5 from 'parse5';
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter';

import { DocumentData } from '../types/snapshot';
import { HTMLDocument } from './html';

/**
 * Create an HTMLDocument object from an string.
 * @param {string} html - html to create the object HTMLDocument
 * @param originalDocument - Previous snatshop of the html.
 */
export const createHTMLDocument = (html: string, finalHref: string, originalDocument?: HTMLDocument): HTMLDocument => {
    const dom = parse5.parse(html, {
        sourceCodeLocationInfo: !originalDocument,
        treeAdapter: htmlparser2Adapter
    }) as DocumentData;

    return new HTMLDocument(dom, finalHref, originalDocument);
};
