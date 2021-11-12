import { URL } from 'url';

import * as parse5 from 'parse5';
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter';
import cssSelect, { selectOne } from 'css-select';

import { createElement } from './create-element';
import { HTMLElement } from './htmlelement';
import { Comment } from './comment';
import { DocumentType } from './documenttype';
import { Node } from './node';
import { Text } from './text';
import { DocumentData, ElementData, NodeData } from './types';
import { getCompiledSelector } from './get-compiled-selector';
import { ensureExpectedParentNodes } from './utils';

/**
 * https://developer.mozilla.org/docs/Web/API/HTMLDocument
 */
export class HTMLDocument extends Node {
    private _document: DocumentData;
    private _documentElement: ElementData;
    private _isFragment: boolean;
    private _nodes = new Map<NodeData, Node>();
    private _pageHTML = '';
    private _base: string;

    public defaultView?: any;
    public originalDocument?: HTMLDocument;

    /**
     * Non-standard. Used internally by utils-dom to create HTMLDocument instances.
     */
    public constructor(document: DocumentData, finalHref: string, originalDocument?: HTMLDocument, isFragment = false) {
        super(document, null as any);
        this._document = document;
        this._documentElement = this.findDocumentElement();
        this._isFragment = isFragment;
        this.originalDocument = originalDocument;

        if (isFragment) {
            ensureExpectedParentNodes(document);
        }

        this._pageHTML = parse5.serialize(document as htmlparser2Adapter.Node, { treeAdapter: htmlparser2Adapter });
        this._base = this.getBaseUrl(finalHref);
        this._nodes.set(document, this);
    }

    private findDocumentElement() {
        return this._document.children.find((node) => {
            return node.type === 'tag' && node.name === 'html';
        }) as ElementData;
    }

    private getBaseUrl(finalHref: string): string {
        const baseElement = this.querySelector('base[href]');
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
        return this.querySelector('body') as HTMLElement;
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
        return this._isFragment;
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Document/title
     */
    public get title(): string {
        return this.querySelector('title')?.textContent || '';
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
    public querySelector(selector: string): HTMLElement | null {
        const data = selectOne(
            getCompiledSelector(selector),
            this._document.children
        );

        return data ? this.getNodeFromData(data) as HTMLElement : null;
    }

    /**
     * https://developer.mozilla.org/docs/Web/API/Document/querySelectorAll
     */
    public querySelectorAll(selector: string): HTMLElement[] {
        const matches: any[] = cssSelect(
            getCompiledSelector(selector),
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
