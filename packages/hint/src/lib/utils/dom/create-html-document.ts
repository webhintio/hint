import { HTMLDocument } from '../../types/html';
import * as parse5 from 'parse5';
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter';

export const createHTMLDocument = (html: string): HTMLDocument => {
    const dom = parse5.parse(html, {
        sourceCodeLocationInfo: true,
        treeAdapter: htmlparser2Adapter
    });

    return new HTMLDocument(dom);
};
