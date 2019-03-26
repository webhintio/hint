import { HTMLDocument } from '../../types/html';
import * as parse5 from 'parse5';
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter';

export const createHTMLDocument = (html: string, originalDocument?: HTMLDocument): HTMLDocument => {
    const dom = parse5.parse(html, {
        sourceCodeLocationInfo: !originalDocument,
        treeAdapter: htmlparser2Adapter
    });

    return new HTMLDocument(dom, originalDocument);
};
