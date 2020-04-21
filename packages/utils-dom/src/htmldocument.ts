import { URL } from 'url';

import * as parse5 from 'parse5';
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter';
import * as cssSelect from 'css-select';

import { createElement } from './create-element';
import { HTMLElement } from './htmlelement';
import { Comment } from './comment';
import { DocumentType } from './documenttype';
import { Node } from './node';
import { Text } from './text';
import { DocumentData, ElementData, NodeData } from './types';

// TODO: Use quick-lru so that it doesn't grow without bounds
const CACHED_CSS_SELECTORS: Map<string, cssSelect.CompiledQuery> = new Map();

/**
 * https://developer.mozilla.org/docs/Web/API/HTMLDocument
 */
export class HTMLDocument extends Node {
    private _document: DocumentData;
    private _documentElement: ElementData;
    private _nodes = new Map<NodeData, Node>();
    private _pageHTML = '';
    private _base: string;

    public defaultView?: any;
    public originalDocument?: HTMLDocument;

    /**
     * Non-standard. Used internally by utils-dom to create HTMLDocument instances.
     */
    public constructor(document: DocumentData, finalHref: string, originalDocument?: HTMLDocument) {
        super(document, null as any);
        this._document = document;
        this._documentElement = this.findDocumentElement();
        this.originalDocument = originalDocument;
        this._pageHTML = parse5.serialize(document, { treeAdapter: htmlparser2Adapter });
        this._base = this.getBaseUrl(finalHref);
        this._nodes.set(document, this);
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

    /**
     * https://developer.mozilla.org/docs/Web/API/Document/documentElement
     */
    public get documentElement(): HTMLElement {
        return this.getNodeFromData(this._documentElement) as HTMLElement;
    }

    /**
     * Non-standard. Used internally by utils-dom to resolve URLs.
     * TODO: Consider replacing with Node.baseURI.
     */
    public get base(): string {
        return this._base;
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Document/body
     */
    public get body(): HTMLElement {
        return this.querySelectorAll('body')[0];
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Document/compatMode
     */
    public get compatMode() {
        return this._document['x-mode'] === 'quirks' ?
            'BackCompat' :
            'CSS1Compat';
    }

    /**
     * Non-standard.
     * Check if this represents a template fragment as opposed to a full document.
     */
    public get isFragment(): boolean {
        // Document is a fragment if `<html>` wasn't part of the original source.
        return !this.originalDocument && !this._documentElement.sourceCodeLocation;
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Document/title
     */
    public get title(): string {
        return this.querySelectorAll('title')[0]?.textContent || '';
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Document/createElement
     */
    public createElement(data: string): HTMLElement {
        return createElement(data, this);
    }

    /**
     * Non-standard. Used internally by utils-dom to get the Node instance
     * associated with the provided backing data.
     */
    public getNodeFromData(data: NodeData): Node {
        if (this._nodes.has(data)) {
            return this._nodes.get(data)!;
        }

        let node: Node;

        switch (data.type) {
            case 'comment':
                node = new Comment(data, this);
                break;
            case 'directive':
                node = new DocumentType(data, this);
                break;
            case 'script':
            case 'style':
            case 'tag':
                node = createElement(data.name, this, data);
                break;
            case 'text':
                node = new Text(data, this);
                break;
            default:
                throw new Error(`Unsupported node type: ${data.type}`);
        }

        this._nodes.set(data, node);

        return node;
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Document/elementsFromPoint
     */
    public elementsFromPoint(x: number, y: number): HTMLElement[] {
        return []; // TODO: find actual elements when bounding rects are available.
    }

    /**
     * Non-standard.
     * Retrieve the outerHTML of the entire document.
     */
    public pageHTML(): string {
        return this._pageHTML;
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Document/querySelector
     */
    public querySelector(selector: string): HTMLElement {
        return this.querySelectorAll(selector)[0];
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Document/querySelectorAll
     */
    public querySelectorAll(selector: string): HTMLElement[] {
        if (!CACHED_CSS_SELECTORS.has(selector)) {
            CACHED_CSS_SELECTORS.set(selector, cssSelect.compile(selector));
        }

        const matches: any[] = cssSelect(
            CACHED_CSS_SELECTORS.get(selector) as cssSelect.CompiledQuery,
            this._document.children
        );

        const result = matches.map((element) => {
            return this.getNodeFromData(element);
        });

        return result as HTMLElement[];
    }

    /**
     * Non-standard.
     * Resolve the provided URL against the base URL for this document.
     */
    public resolveUrl(url: string) {
        return new URL(url, this._base).href;
    }
}
