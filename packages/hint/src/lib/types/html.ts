import * as parse5 from 'parse5';
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter';
import * as cssSelect from 'css-select';

import { ProblemLocation } from '../types';

type Attrib = {
    [key: string]: string;
};

export type HTMLAttribute = {
    /** Attribute name of the element */
    name: string;

    /** Attribute value of the element */
    value: string;
};

export interface INamedNodeMap {
    [index: number]: HTMLAttribute;
    item?(index: number): HTMLAttribute | null;
    readonly length: number;
}

type ParsedHTMLElement = {
    attribs: Attrib;
    children: ParsedHTMLElement[];
    next: ParsedHTMLElement | null;
    nodeType: number;
    parent: ParsedHTMLElement | null;
    prev: ParsedHTMLElement | null;
    sourceCodeLocation: parse5.ElementLocation;
    tagName: string;
}

export class HTMLElement {
    public ownerDocument?: HTMLDocument;

    private _element: ParsedHTMLElement;

    public constructor(element: ParsedHTMLElement | HTMLElement, ownerDocument?: HTMLDocument) {
        this._element = element instanceof HTMLElement ? element._element : element;
        this.ownerDocument = ownerDocument;
    }

    public get attributes(): INamedNodeMap {
        const x = this._element.attribs;

        return Object.entries(x).map(([name, value]) => {
            return {
                name,
                value
            };
        });
    }

    public get children(): HTMLElement[] {
        const result: HTMLElement[] = [];

        for (const child of this._element.children) {
            if (child.nodeType === 1) {
                result.push(new HTMLElement(child as ParsedHTMLElement, this.ownerDocument));
            }
        }

        return result;
    }

    public get nodeName(): string {
        return this._element.tagName;
    }

    public getAttribute(attribute: string): string | null {
        const attrib = this._element.attribs[attribute];
        const value = typeof attrib !== 'undefined' ? attrib : null;

        return value;
    }

    /**
     * zero-based location of the element.
     */
    public getLocation(): ProblemLocation {
        const location = this._element.sourceCodeLocation;

        return {
            // Column is zero-based, but pointing to the tag name, not the character <
            column: location.startCol,
            line: location.startLine - 1
        };
    }

    public isSame(element: HTMLElement): boolean {
        return this._element === element._element;
    }

    public outerHTML(): string {
        /*
         * Until parse5 support outerHTML
         * (https://github.com/inikulin/parse5/issues/230)
         * we need to use this workaround.
         * https://github.com/inikulin/parse5/issues/118
         *
         * The problem with this workaround will modify the
         * parentElement and parentNode of the element, so we
         * need to restore it before return the outerHTML.
         */
        const fragment = htmlparser2Adapter.createDocumentFragment();
        const { parent, next, prev } = this._element;

        htmlparser2Adapter.appendChild(fragment, this._element);

        const result = parse5.serialize(fragment, { treeAdapter: htmlparser2Adapter });

        this._element.parent = parent;
        this._element.next = next;
        this._element.prev = prev;

        if (next) {
            next.prev = this._element;
        }

        if (prev) {
            prev.next = this._element;
        }

        return result;
    }
}

export class HTMLDocument {
    private _document: any;
    private _pageHTML = '';

    public constructor(document: parse5.Document) {
        this._document = document;
        this._pageHTML = parse5.serialize(document, { treeAdapter: htmlparser2Adapter });
    }

    public get documentElement(): HTMLElement {
        const htmlNode = this._document.children.find((node: any) => {
            return node.type === 'tag' && node.name === 'html';
        });

        return new HTMLElement(htmlNode, this);
    }

    public pageHTML(): string {
        return this._pageHTML;
    }

    public querySelectorAll(selector: string): HTMLElement[] {
        const matches: any[] = cssSelect(selector, this._document.children);

        const result = matches.map((element) => {
            return new HTMLElement(element, this);
        });

        return result;
    }
}
