import * as parse5 from 'parse5';
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter';

import { DocumentData, DocumentFragmentData, ElementData } from './types';
import { HTMLDocument } from './htmldocument';

/**
 * Create an HTMLDocument object from an string.
 * @param {string} html - html to create the object HTMLDocument
 * @param originalDocument - Previous snatshop of the html.
 */
export const createHTMLDocument = (html: string, finalHref: string, originalDocument?: HTMLDocument): HTMLDocument => {
    const isFragment = !(/(<!doctype|<html\b)/i).test(html);
    const dom = parse5.parse(isFragment ? '' : html, {
        sourceCodeLocationInfo: !originalDocument,
        treeAdapter: htmlparser2Adapter
    }) as DocumentData;

    if (isFragment) {
        const body = (dom.children[0] as ElementData).children[1] as ElementData;
        const fragment = parse5.parseFragment(html, {
            sourceCodeLocationInfo: !originalDocument,
            treeAdapter: htmlparser2Adapter
        }) as DocumentFragmentData;

        body.children = fragment.children;

        for (const child of body.children) {
            child.parent = body;
        }
    }

    return new HTMLDocument(dom, finalHref, originalDocument, isFragment);
};
