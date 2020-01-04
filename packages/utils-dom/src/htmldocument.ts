import { URL } from 'url';

import * as parse5 from 'parse5';
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter';
import * as cssSelect from 'css-select';

import { HTMLElement } from './htmlelement';
import { DocumentData, ElementData } from './types';

// TODO: Use quick-lru so that it doesn't grow without bounds
const CACHED_CSS_SELECTORS: Map<string, cssSelect.CompiledQuery> = new Map();

export class HTMLDocument {
    private _document: DocumentData;
    private _documentElement: ElementData;
    private _pageHTML = '';
    private _base: string;

    public originalDocument?: HTMLDocument;

    public constructor(document: DocumentData, finalHref: string, originalDocument?: HTMLDocument) {
        this._document = document;
        this._documentElement = this.findDocumentElement();
        this.originalDocument = originalDocument;
        this._pageHTML = parse5.serialize(document, { treeAdapter: htmlparser2Adapter });
        this._base = this.getBaseUrl(finalHref);
    }

    private findDocumentElement() {
        return this._document.children.find((node) => {
            return node.type === 'tag' && node.name === 'html';
        }) as ElementData;
    }

    private getBaseUrl(finalHref: string): string {
        const baseElement = this.querySelectorAll('base[href]')[0];
        const baseHref = baseElement ? baseElement.getAttribute('href') : null;

        if (!baseHref) {
            return new URL(finalHref).href;
        }

        return new URL(baseHref, finalHref).href;
    }

    public get documentElement(): HTMLElement {
        return new HTMLElement(this._documentElement, this);
    }

    public get base(): string {
        return this._base;
    }

    public get compatMode() {
        return this._document['x-mode'] === 'quirks' ?
            'BackCompat' :
            'CSS1Compat';
    }

    /**
     * Check if this represents a template fragment as opposed to a full document.
     */
    public get isFragment(): boolean {
        // Document is a fragment if `<html>` wasn't part of the original source.
        return !this.originalDocument && !this._documentElement.sourceCodeLocation;
    }

    public pageHTML(): string {
        return this._pageHTML;
    }

    public querySelectorAll(selector: string): HTMLElement[] {
        if (!CACHED_CSS_SELECTORS.has(selector)) {
            CACHED_CSS_SELECTORS.set(selector, cssSelect.compile(selector));
        }

        const matches: any[] = cssSelect(
            CACHED_CSS_SELECTORS.get(selector) as cssSelect.CompiledQuery,
            this._document.children
        );

        const result = matches.map((element) => {
            return new HTMLElement(element, this);
        });

        return result;
    }

    public resolveUrl(url: string) {
        return new URL(url, this._base).href;
    }
}
